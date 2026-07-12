import React, { useState } from 'react';
import loginStyle from './Login.module.scss';
import TextInput from '../../components/common/inputs/TextInput';
import ButtonInput from '../../components/common/inputs/ButtonInput';
import { useLogin } from '../../hooks/login';
import { useTranslator } from '../../hooks/translator';
import { useMessageStore } from '../../stores/messageStore';
import { EResponseError } from '@packages/enum';
import Banner from './Banner';

const Login = () => {
  const { t } = useTranslator();
  const { loading, error, execute } = useLogin();
  const storeError = useMessageStore((s) => s.error);
  const setStoreError = useMessageStore((s) => s.setError);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = !!username && !!password && !loading;

  // storeError comes from the auth/refresh flow (e.g. an auto-logout). Map an
  // expired session to a "log in again" prompt and anything else to a generic
  // retry message; the raw enum value is never shown to the user.
  const storeErrorMessage = storeError
    ? storeError === EResponseError.RefreshTokenExpired
      ? t('login.sessionExpired')
      : t('login.genericError')
    : null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Clear any stale session message before a fresh attempt.
    setStoreError(null);
    execute(username, password);
  };

  return (
    <div className={` ${loginStyle.screen}`}>
      <form className={`card`} onSubmit={handleSubmit}>
        <div className={` ${loginStyle.header}`}>
          <Banner />
          <span className={`font-size-sm font-light logo-sub`}>
            {t('login.subtitle')}
          </span>
        </div>

        <TextInput
          title={t('login.username')}
          value={username}
          onChange={setUsername}
          placeholder={t('login.usernamePlaceholder')}
          disabled={loading}
        />

        <TextInput
          title={t('login.password')}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={t('login.passwordPlaceholder')}
          disabled={loading}
        />

        {error && <p className={`font-size-sm error`}>{t('login.error')}</p>}

        {storeErrorMessage && (
          <p className={`font-size-sm error`}>{storeErrorMessage}</p>
        )}

        <div className={loginStyle.actions}>
          <ButtonInput
            label={loading ? t('login.submitting') : t('login.submit')}
            disabled={!canSubmit}
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
