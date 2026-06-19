import React, { useState } from 'react';
import loginStyle from './Login.module.scss';
import TextInput from '../../components/common/inputs/TextInput';
import ButtonInput from '../../components/common/inputs/ButtonInput';
import { useLogin } from '../../hooks/login';
import { useTranslator } from '../../hooks/translator';
import Banner from './Banner';

const Login = () => {
  const { t } = useTranslator();
  const { loading, error, execute } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = !!username && !!password && !loading;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
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
