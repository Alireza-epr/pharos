import React from 'react';
import ButtonInput from '../common/inputs/ButtonInput';
import { useTranslator } from '../../hooks/translator';
import mapErrorStyle from './MapErrorBoundary.module.scss';

export interface IMapErrorBoundaryProps {
  children: React.ReactNode;
}

interface IMapErrorBoundaryState {
  hasError: boolean;
}

interface IMapErrorFallbackProps {
  onRetry: () => void;
}

// Functional fallback so the error UI can use the translator hook (class
// components can't consume context via hooks directly).
const MapErrorFallback = (props: IMapErrorFallbackProps) => {
  const { t } = useTranslator();

  return (
    <div className={` ${mapErrorStyle.wrapper}`} role="alert">
      <div>
        <p className={` ${mapErrorStyle.title}`}>{t('map.error.title')}</p>
        <ButtonInput
          label={t('map.error.retry')}
          onClick={props.onRetry}
          size="sm"
        />
      </div>
    </div>
  );
};

/**
 * Error boundary scoped to the map area only: a failure inside this subtree
 * degrades just this region into a retry-able fallback instead of blanking the
 * whole app.
 *
 * How it works — React (the react-dom reconciler), not our code, drives this:
 * when a descendant throws during the render/lifecycle phase, React unwinds the
 * fiber tree, finds the nearest ancestor that defines the static
 * `getDerivedStateFromError` and/or `componentDidCatch` hooks (this class), and
 * invokes them. We never call them ourselves.
 *
 * What it catches:
 *  - the lazy `import('./MapCanvas')` chunk failing to download (common after a
 *    deploy when the old chunk hash 404s, or when offline) — Suspense re-throws
 *    the rejected promise during render, so it reaches us here;
 *  - anything MapCanvas (and its future children) throws while rendering, e.g.
 *    WebGL unavailable or an invalid map style on init.
 *
 * What it does NOT catch — these never pass through React's render phase, so the
 * boundary never sees them and they need their own handling:
 *  - errors in event handlers, timeouts, or promises;
 *  - maplibre runtime failures after the map is live (e.g. a tile request
 *    failing mid-session) — those go through `map.on('error', …)` instead.
 */
class MapErrorBoundary extends React.Component<
  IMapErrorBoundaryProps,
  IMapErrorBoundaryState
> {
  state: IMapErrorBoundaryState = { hasError: false };

  // Render-phase hook: must be pure (no side effects). React calls it with the
  // thrown value and merges the return into state, then re-renders this boundary
  // — at which point `render()` swaps children for the fallback. It is `static`
  // because the instance that just threw can't be trusted.
  static getDerivedStateFromError(): IMapErrorBoundaryState {
    return { hasError: true };
  }

  // Commit-phase hook: the place for side effects (logging/reporting). React
  // calls it after the fallback has committed, so it's safe to do work here.
  componentDidCatch(error: unknown) {
    console.error('MapView failed to render:', error);
  }

  // Clears the error and remounts children, letting a transient failure (e.g. a
  // network blip on the chunk fetch) recover without a full page reload.
  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <MapErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
