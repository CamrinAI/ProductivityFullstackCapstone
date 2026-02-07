"""
Seed script to create demo users with different roles for testing.
Run this script to populate the database with test users.
"""
from app import create_app, db
from app.models import User, Tool, Material
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def seed_demo_users():
    app = create_app()
    
    with app.app_context():
        # Check if users already exist
        if User.query.filter_by(username='demo').first():
            print("Demo users already exist. Skipping...")
            return
        
        # Create demo users with different roles
        users = [
            {
                'username': 'demo',
                'email': 'demo@example.com',
                'password': 'demo123',
                'role': 'technician',
                'company': 'Demo Company'
            },
            {
                'username': 'foreman',
                'email': 'foreman@example.com',
                'password': 'foreman123',
                'role': 'foreman',
                'company': 'Demo Company'
            },
            {
                'username': 'super',
                'email': 'super@example.com',
                'password': 'super123',
                'role': 'superintendent',
                'company': 'Demo Company'
            },
            {
                'username': 'john_smith',
                'email': 'john@example.com',
                'password': 'password123',
                'role': 'technician',
                'company': 'ABC Construction'
            },
            {
                'username': 'sarah_jones',
                'email': 'sarah@example.com',
                'password': 'password123',
                'role': 'technician',
                'company': 'ABC Construction'
            },
            {
                'username': 'mike_wilson',
                'email': 'mike@example.com',
                'password': 'password123',
                'role': 'technician',
                'company': 'XYZ Electric'
            },
            {
                'username': 'lisa_brown',
                'email': 'lisa@example.com',
                'password': 'password123',
                'role': 'foreman',
                'company': 'XYZ Electric'
            }
        ]
        
        created_users = []
        for user_data in users:
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=generate_password_hash(user_data['password']),
                role=user_data['role'],
                company=user_data['company']
            )
            db.session.add(user)
            created_users.append(user)
            print(f"Created user: {user_data['username']} (role: {user_data['role']})")
        
        db.session.commit()
        
        # Create demo tools with some checked out to employees
        tools_data = [
            {
                'name': 'Makita Hammer Drill',
                'asset_type': 'power_tool',
                'serial_number': 'HD-2024-001',
                'location': 'Site A - Building 3',
                'description': '18V cordless hammer drill with 2 batteries',
                'checked_out_by': created_users[3].id,  # john_smith
                'is_available': False,
                'checkout_date': datetime.utcnow() - timedelta(days=2)
            },
            {
                'name': 'DeWalt Circular Saw',
                'asset_type': 'power_tool',
                'serial_number': 'CS-2024-002',
                'location': 'Site A - Building 3',
                'description': '7-1/4 inch circular saw',
                'checked_out_by': created_users[3].id,  # john_smith
                'is_available': False,
                'checkout_date': datetime.utcnow() - timedelta(days=2)
            },
            {
                'name': 'Milwaukee Impact Driver',
                'asset_type': 'power_tool',
                'serial_number': 'ID-2024-003',
                'location': 'Site B - Floor 2',
                'description': '18V impact driver kit',
                'checked_out_by': created_users[4].id,  # sarah_jones
                'is_available': False,
                'checkout_date': datetime.utcnow() - timedelta(hours=5)
            },
            {
                'name': 'Level - 48 inch',
                'asset_type': 'hand_tool',
                'serial_number': 'LV-2024-004',
                'location': 'Site B - Floor 2',
                'description': 'Professional 48" level',
                'checked_out_by': created_users[5].id,  # mike_wilson
                'is_available': False,
                'checkout_date': datetime.utcnow() - timedelta(hours=3)
            },
            {
                'name': 'Klein Multimeter',
                'asset_type': 'testing_equipment',
                'serial_number': 'MM-2024-005',
                'location': 'Site B - Floor 2',
                'description': 'Digital multimeter with clamp',
                'checked_out_by': created_users[5].id,  # mike_wilson
                'is_available': False,
                'checkout_date': datetime.utcnow() - timedelta(hours=3)
            },
            {
                'name': 'Wire Stripper Set',
                'asset_type': 'hand_tool',
                'serial_number': 'WS-2024-006',
                'location': 'Site B - Floor 2',
                'description': 'Professional wire stripper set',
                'checked_out_by': created_users[5].id,  # mike_wilson
                'is_available': False,
                'checkout_date': datetime.utcnow() - timedelta(hours=3)
            },
            {
                'name': 'Laser Distance Meter',
                'asset_type': 'measuring_tool',
                'serial_number': 'LD-2024-007',
                'location': 'Warehouse',
                'description': 'Bosch laser distance meter',
                'is_available': True
            },
            {
                'name': 'Extension Cord - 50ft',
                'asset_type': 'accessory',
                'serial_number': 'EC-2024-008',
                'location': 'Warehouse',
                'description': 'Heavy duty 50ft extension cord',
                'is_available': True
            }
        ]
        
        for tool_data in tools_data:
            tool = Tool(**tool_data)
            db.session.add(tool)
        
        db.session.commit()
        
        # Create demo materials
        materials_data = [
            {
                'name': 'Electrical Wire (12 AWG)',
                'unit': 'feet',
                'quantity': 250,
                'min_stock': 100,
                'location': 'Warehouse - Electrical Section',
                'cost_per_unit': 0.45
            },
            {
                'name': 'Bolts (M8 x 20mm)',
                'unit': 'box',
                'quantity': 15,
                'min_stock': 10,
                'location': 'Warehouse - Hardware Aisle',
                'cost_per_unit': 12.99
            },
            {
                'name': 'Lug Nuts',
                'unit': 'box',
                'quantity': 8,
                'min_stock': 5,
                'location': 'Warehouse - Automotive Section',
                'cost_per_unit': 18.50
            },
            {
                'name': 'Drywall Screws (1-5/8")',
                'unit': 'box',
                'quantity': 3,
                'min_stock': 5,
                'location': 'Warehouse - Fasteners',
                'cost_per_unit': 9.99
            },
            {
                'name': 'Wire Connectors',
                'unit': 'pack',
                'quantity': 25,
                'min_stock': 10,
                'location': 'Warehouse - Electrical Section',
                'cost_per_unit': 6.50
            },
            {
                'name': 'Cable Ties (8 inch)',
                'unit': 'pack',
                'quantity': 12,
                'min_stock': 8,
                'location': 'Warehouse - Cable Management',
                'cost_per_unit': 7.25
            },
            {
                'name': 'Duct Tape',
                'unit': 'roll',
                'quantity': 18,
                'min_stock': 10,
                'location': 'Warehouse - Supplies',
                'cost_per_unit': 5.99
            },
            {
                'name': 'Safety Glasses',
                'unit': 'pair',
                'quantity': 45,
                'min_stock': 20,
                'location': 'Warehouse - Safety Equipment',
                'cost_per_unit': 3.50
            }
        ]
        
        for material_data in materials_data:
            material = Material(**material_data)
            db.session.add(material)
        
        db.session.commit()
        
        print("\n✅ Demo users, tools, and materials created successfully!")
        print("\nLogin credentials:")
        print("  Technician      -> username: demo        | password: demo123")
        print("  Foreman         -> username: foreman     | password: foreman123")
        print("  Superintendent  -> username: super       | password: super123")
        print("\nDemo Employees (all password: password123):")
        print("  john_smith   - Has 2 tools checked out")
        print("  sarah_jones  - Has 1 tool checked out")
        print("  mike_wilson  - Has 3 tools checked out")
        print("  lisa_brown   - Available (no tools)")
        print("\nDemo Materials:")
        print("  - Electrical Wire, Bolts, Lug Nuts, Screws, Wire Connectors")
        print("  - Cable Ties, Duct Tape, Safety Glasses")
        print("  - Some items below minimum stock (need reorder)")

if __name__ == '__main__':
    seed_demo_users()
