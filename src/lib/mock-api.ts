// Mock API responses for development
export const mockData = {
  "users": [
    {
      "id": "1",
      "email": "admin@modernmen.com",
      "name": "Master Administrator",
      "role": "super-admin",
      "isActive": true,
      "createdAt": "2025-08-31T17:37:42.859Z"
    },
    {
      "id": "2",
      "email": "manager@modernmen.com",
      "name": "Store Manager",
      "role": "manager",
      "isActive": true,
      "createdAt": "2025-08-31T17:37:42.860Z"
    },
    {
      "id": "3",
      "email": "stylist1@modernmen.com",
      "name": "John Smith",
      "role": "stylist",
      "isActive": true,
      "createdAt": "2025-08-31T17:37:42.860Z"
    }
  ],
  "employees": [
    {
      "id": "1",
      "userId": "3",
      "name": "John Smith",
      "email": "stylist1@modernmen.com",
      "role": "stylist",
      "specialization": "Hair Cutting",
      "rating": 4.8,
      "isActive": true,
      "createdAt": "2025-08-31T17:37:42.860Z"
    }
  ],
  "services": [
    {
      "id": "1",
      "name": "Classic Haircut",
      "description": "Professional haircut with styling",
      "price": 35,
      "duration": 45,
      "category": "haircut",
      "isActive": true
    },
    {
      "id": "2",
      "name": "Beard Trim",
      "description": "Precision beard trimming and shaping",
      "price": 25,
      "duration": 30,
      "category": "beard",
      "isActive": true
    }
  ]
};

export function getMockUsers(filters: { role?: string; search?: string } = {}) {
  let users = mockData.users;
  
  if (filters.role) {
    users = users.filter(user => user.role === filters.role);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    users = users.filter(user => 
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }
  
  return {
    users,
    total: users.length,
    page: 1,
    totalPages: 1
  };
}

export function getMockEmployees(filters: { specialization?: string; search?: string } = {}) {
  let employees = mockData.employees;
  
  if (filters.specialization) {
    employees = employees.filter(emp => emp.specialization === filters.specialization);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    employees = employees.filter(emp => 
      emp.name.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search)
    );
  }
  
  return {
    employees,
    total: employees.length,
    page: 1,
    totalPages: 1
  };
}
