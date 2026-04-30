import { ERequestUserRole } from '../../helpers/enum/tokenEnum';

export const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: ERequestUserRole.admin,
  },
  {
    id: 2,
    username: 'editor',
    password: 'edit123',
    role: ERequestUserRole.readAndwrite,
  },
  {
    id: 3,
    username: 'writer',
    password: 'write123',
    role: ERequestUserRole.writeOnly,
  },
  {
    id: 4,
    username: 'reader',
    password: 'read123',
    role: ERequestUserRole.readOnly,
  },
  {
    id: 5,
    username: 'guest',
    password: 'guest123',
    role: ERequestUserRole.noRight,
  },
];
