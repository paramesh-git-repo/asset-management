const Asset = require('../models/Asset');
const Employee = require('../models/Employee');

// Import database connection
require('../db');

// Sample employee data
const sampleEmployees = [
  {
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    department: 'IT',
    position: 'Software Engineer',
    hireDate: new Date('2022-01-15'),
    salary: 75000,
    location: 'New York',
    status: 'Active',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1234567891',
      email: 'jane.doe@email.com'
    }
  },
  {
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1234567892',
    department: 'HR',
    position: 'HR Manager',
    hireDate: new Date('2021-06-20'),
    salary: 65000,
    location: 'Los Angeles',
    status: 'Active',
    skills: ['HR Management', 'Recruitment', 'Employee Relations'],
    emergencyContact: {
      name: 'Mike Johnson',
      relationship: 'Spouse',
      phone: '+1234567893',
      email: 'mike.johnson@email.com'
    }
  },
  {
    employeeId: 'EMP003',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@company.com',
    phone: '+1234567894',
    department: 'Finance',
    position: 'Financial Analyst',
    hireDate: new Date('2022-03-10'),
    salary: 70000,
    location: 'Chicago',
    status: 'Active',
    skills: ['Financial Analysis', 'Excel', 'QuickBooks', 'Budgeting'],
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Spouse',
      phone: '+1234567895',
      email: 'lisa.chen@email.com'
    }
  },
  {
    employeeId: 'EMP004',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@company.com',
    phone: '+1234567896',
    department: 'Marketing',
    position: 'Marketing Specialist',
    hireDate: new Date('2022-08-05'),
    salary: 55000,
    location: 'Miami',
    status: 'Active',
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'SEO'],
    emergencyContact: {
      name: 'David Brown',
      relationship: 'Spouse',
      phone: '+1234567897',
      email: 'david.brown@email.com'
    }
  },
  {
    employeeId: 'EMP005',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@company.com',
    phone: '+1234567898',
    department: 'Operations',
    position: 'Operations Manager',
    hireDate: new Date('2021-11-12'),
    salary: 80000,
    location: 'Seattle',
    status: 'Active',
    skills: ['Operations Management', 'Process Improvement', 'Team Leadership'],
    emergencyContact: {
      name: 'Jennifer Wilson',
      relationship: 'Spouse',
      phone: '+1234567899',
      email: 'jennifer.wilson@email.com'
    }
  }
];

// Sample asset data
const sampleAssets = [
  {
    assetId: 'AST001',
    name: 'MacBook Pro 16"',
    category: 'Electronics',
    status: 'Active',
    location: 'IT Department - Floor 3',
    purchaseDate: new Date('2022-02-15'),
    purchasePrice: 2499,
    currentValue: 2200,
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" M1 Pro',
    serialNumber: 'MBP16-M1P-2022-001',
    warrantyExpiry: new Date('2025-02-15'),
    description: '16-inch MacBook Pro with M1 Pro chip for software development',
    tags: ['laptop', 'development', 'high-value']
  },
  {
    assetId: 'AST002',
    name: 'Office Desk Set',
    category: 'Furniture',
    status: 'Active',
    location: 'Marketing Department - Floor 2',
    purchaseDate: new Date('2022-01-10'),
    purchasePrice: 800,
    currentValue: 750,
    manufacturer: 'OfficeMax',
    model: 'Executive Desk Set',
    description: 'Complete office desk set including desk, chair, and filing cabinet',
    tags: ['furniture', 'office', 'ergonomic']
  },
  {
    assetId: 'AST003',
    name: 'Company Vehicle - Ford Transit',
    category: 'Vehicles',
    status: 'Active',
    location: 'Company Garage',
    purchaseDate: new Date('2021-09-20'),
    purchasePrice: 35000,
    currentValue: 32000,
    manufacturer: 'Ford',
    model: 'Transit 250',
    serialNumber: 'VIN-FORD-TRANSIT-2021-001',
    description: 'Company van for deliveries and team transportation',
    tags: ['vehicle', 'transportation', 'delivery']
  },
  {
    assetId: 'AST004',
    name: '3D Printer - Ultimaker',
    category: 'Machinery',
    status: 'Active',
    location: 'R&D Lab - Floor 4',
    purchaseDate: new Date('2022-04-05'),
    purchasePrice: 3500,
    currentValue: 3200,
    manufacturer: 'Ultimaker',
    model: 'S5',
    serialNumber: 'UM-S5-2022-001',
    warrantyExpiry: new Date('2024-04-05'),
    description: 'Professional 3D printer for prototyping and research',
    tags: ['3d-printer', 'prototyping', 'research']
  },
  {
    assetId: 'AST005',
    name: 'Adobe Creative Suite License',
    category: 'Software',
    status: 'Active',
    location: 'Marketing Department',
    purchaseDate: new Date('2022-01-01'),
    purchasePrice: 600,
    currentValue: 600,
    manufacturer: 'Adobe',
    model: 'Creative Suite 2022',
    description: 'Annual license for Adobe Creative Suite including Photoshop, Illustrator, and InDesign',
    tags: ['software', 'design', 'annual-license']
  },
  {
    assetId: 'AST006',
    name: 'Conference Room Projector',
    category: 'Electronics',
    status: 'Active',
    location: 'Conference Room A - Floor 1',
    purchaseDate: new Date('2021-12-15'),
    purchasePrice: 1200,
    currentValue: 1100,
    manufacturer: 'Epson',
    model: 'PowerLite 1781W',
    serialNumber: 'EPSON-PL1781W-2021-001',
    warrantyExpiry: new Date('2024-12-15'),
    description: 'Wireless projector for conference room presentations',
    tags: ['projector', 'presentation', 'wireless']
  },
  {
    assetId: 'AST007',
    name: 'Industrial Coffee Machine',
    category: 'Machinery',
    status: 'Active',
    location: 'Break Room - Floor 1',
    purchaseDate: new Date('2022-03-01'),
    purchasePrice: 2500,
    currentValue: 2300,
    manufacturer: 'Breville',
    model: 'Oracle Touch',
    serialNumber: 'BREV-ORACLE-2022-001',
    warrantyExpiry: new Date('2024-03-01'),
    description: 'Professional coffee machine for employee break room',
    tags: ['coffee-machine', 'break-room', 'employee-benefit']
  },
  {
    assetId: 'AST008',
    name: 'Security Camera System',
    category: 'Electronics',
    status: 'Active',
    location: 'Building Perimeter',
    purchaseDate: new Date('2021-08-10'),
    purchasePrice: 4500,
    currentValue: 4100,
    manufacturer: 'Hikvision',
    model: 'IP Camera System',
    serialNumber: 'HIKV-IP-2021-001',
    warrantyExpiry: new Date('2024-08-10'),
    description: 'Complete IP camera security system for building perimeter',
    tags: ['security', 'cameras', 'surveillance']
  }
];



// Seed employees
async function seedEmployees() {
  try {
    // Clear existing employees
    await Employee.deleteMany({});
    console.log('🗑️  Cleared existing employees');

    // Insert sample employees
    const employees = await Employee.insertMany(sampleEmployees);
    console.log(`✅ Inserted ${employees.length} employees`);

    // Set up manager-subordinate relationships
    const hrManager = employees.find(emp => emp.position === 'HR Manager');
    const operationsManager = employees.find(emp => emp.position === 'Operations Manager');
    
    if (hrManager && operationsManager) {
      // Set HR Manager as manager for some employees
      await Employee.findByIdAndUpdate(employees[0]._id, { manager: hrManager._id });
      await Employee.findByIdAndUpdate(employees[2]._id, { manager: hrManager._id });
      
      // Set Operations Manager as manager for some employees
      await Employee.findByIdAndUpdate(employees[3]._id, { manager: operationsManager._id });
      
      // Add subordinates to managers
      await Employee.findByIdAndUpdate(hrManager._id, { 
        subordinates: [employees[0]._id, employees[2]._id] 
      });
      await Employee.findByIdAndUpdate(operationsManager._id, { 
        subordinates: [employees[3]._id] 
      });
      
      console.log('✅ Set up manager-subordinate relationships');
    }

    return employees;
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
    throw error;
  }
}

// Seed assets
async function seedAssets(employees) {
  try {
    // Clear existing assets
    await Asset.deleteMany({});
    console.log('🗑️  Cleared existing assets');

    // Assign some assets to employees
    const itEmployee = employees.find(emp => emp.department === 'IT');
    const marketingEmployee = employees.find(emp => emp.department === 'Marketing');
    const operationsEmployee = employees.find(emp => emp.department === 'Operations');

    if (itEmployee) {
      sampleAssets[0].assignedTo = itEmployee._id; // MacBook Pro
      sampleAssets[3].assignedTo = itEmployee._id; // 3D Printer
    }
    
    if (marketingEmployee) {
      sampleAssets[1].assignedTo = marketingEmployee._id; // Office Desk Set
      sampleAssets[4].assignedTo = marketingEmployee._id; // Adobe Creative Suite
      sampleAssets[5].assignedTo = marketingEmployee._id; // Conference Room Projector
    }
    
    if (operationsEmployee) {
      sampleAssets[2].assignedTo = operationsEmployee._id; // Company Vehicle
      sampleAssets[6].assignedTo = operationsEmployee._id; // Coffee Machine
    }

    // Insert sample assets
    const assets = await Asset.insertMany(sampleAssets);
    console.log(`✅ Inserted ${assets.length} assets`);

    return assets;
  } catch (error) {
    console.error('❌ Error seeding assets:', error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Database connection is handled by db.js
    console.log('📊 Using MongoDB Atlas connection...');
    
    const employees = await seedEmployees();
    const assets = await seedAssets(employees);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Seeded ${employees.length} employees and ${assets.length} assets`);
    
    // Display some statistics
    const totalAssetValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalPurchaseValue = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
    
    console.log(`💰 Total Asset Value: $${totalAssetValue.toLocaleString()}`);
    console.log(`💸 Total Purchase Value: $${totalPurchaseValue.toLocaleString()}`);
    console.log(`📉 Total Depreciation: $${(totalPurchaseValue - totalAssetValue).toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleEmployees, sampleAssets };
