export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string; // 'Admin' | 'Employee'
  modules: string[];
}

export const initMockDb = () => {
  if (typeof window === 'undefined') return;

  const users = localStorage.getItem('jafri_users');
  if (!users) {
    const adminAccount: Employee = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@jafri.com',
      password: 'admin',
      role: 'Admin',
      modules: []
    };
    localStorage.setItem('jafri_users', JSON.stringify([adminAccount]));
  }
};

export const getEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];
  initMockDb();
  const users = localStorage.getItem('jafri_users');
  return users ? JSON.parse(users) : [];
};

export const saveEmployee = (employee: Employee) => {
  if (typeof window === 'undefined') return;
  initMockDb();
  const users = getEmployees();
  users.push(employee);
  localStorage.setItem('jafri_users', JSON.stringify(users));
};

export const getActiveUser = (): Employee | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('jafri_active_user');
  return user ? JSON.parse(user) : null;
};

export const setActiveUser = (employee: Employee | null) => {
  if (typeof window === 'undefined') return;
  if (employee) {
    localStorage.setItem('jafri_active_user', JSON.stringify(employee));
  } else {
    localStorage.removeItem('jafri_active_user');
  }
};
