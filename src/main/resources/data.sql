-- Demo seed data for College PBL Viva Demonstration
-- Seed user with password 'password123' (BCrypt hash)
INSERT INTO users (user_id, full_name, email, password_hash)
VALUES (1, 'Rithish Kumar', 'demo@smartledger.local', '$2a$10$eE04wW52gqW9YJg9Y4W91.oUvjJ9jW.832c3f5g5r2.u3W0j0w4aG')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Seed Electricity records showcasing Progressive Slabs and Fair Split
INSERT INTO electricity_records (record_id, user_id, record_date, total_amount, billing_month, master_eb_units, total_eb_amount, is_shared, my_submeter_units, other_submeter_units, calculated_my_share, paid_date)
VALUES (1, 1, '2026-08-15', 380.0, '2026-08', 350.0, 950.0, true, 140.0, 210.0, 380.0, '2026-08-15'),
       (2, 1, '2026-09-15', 542.14, '2026-09', 420.0, 1265.0, true, 180.0, 240.0, 542.14, '2026-09-15')
ON DUPLICATE KEY UPDATE record_id=record_id;

-- Seed LPG records showcasing finished cylinder burn rate and active cylinder countdown
INSERT INTO gas_records (record_id, user_id, record_date, total_amount, cylinder_weight_kg, booking_cost, connected_date, finished_date, burn_rate_per_day, is_active)
VALUES (1, 1, '2026-07-01', 850.0, 14.2, 850.0, '2026-07-01', '2026-08-05', 0.4057, false),
       (2, 1, '2026-08-06', 850.0, 14.2, 850.0, '2026-08-06', NULL, NULL, true)
ON DUPLICATE KEY UPDATE record_id=record_id;

-- Seed Telecom records showcasing active, expiring soon, and blackout statuses
INSERT INTO telecom_records (record_id, user_id, record_date, total_amount, family_member_name, service_provider, plan_amount, recharge_date, validity_days, expiry_date)
VALUES (1, 1, '2026-08-01', 719.0, 'Rithish (Self)', 'Jio', 719.0, '2026-08-01', 84, '2026-10-24'),
       (2, 1, '2026-08-27', 299.0, 'Mom', 'Airtel', 299.0, '2026-08-27', 28, '2026-09-24'),
       (3, 1, '2026-08-10', 199.0, 'Dad', 'BSNL', 199.0, '2026-08-10', 30, '2026-09-09')
ON DUPLICATE KEY UPDATE record_id=record_id;

-- Seed Transport records showcasing vehicle mileage and public transit
INSERT INTO transport_records (record_id, user_id, record_date, total_amount, commute_type, person_name, origin_point, destination_point, distance_km, liters_filled, total_fare_cost, mileage_calculated, cost_per_km, entry_date)
VALUES (1, 1, '2026-09-18', 255.0, 'FUEL', 'Rithish', 'Home', 'College Campus', 45.0, 2.5, 255.0, 18.0, 5.67, '2026-09-18'),
       (2, 1, '2026-09-20', 40.0, 'PUBLIC_TICKET', 'Rithish', 'Home', 'City Center', 25.0, NULL, 40.0, NULL, 1.60, '2026-09-20')
ON DUPLICATE KEY UPDATE record_id=record_id;

-- Seed Grocery records showcasing essential vs discretionary categories
INSERT INTO grocery_records (record_id, user_id, record_date, total_amount, store_name, category, purchase_date, receipt_notes)
VALUES (1, 1, '2026-09-10', 1450.0, 'Reliance Fresh', 'ESSENTIAL_STAPLE', '2026-09-10', 'Rice 10kg, Wheat flour 5kg, Dal 2kg'),
       (2, 1, '2026-09-15', 380.0, 'Daily Dairy', 'DAIRY_PRODUCE', '2026-09-15', 'Milk, curd, butter'),
       (3, 1, '2026-09-18', 350.0, 'Sweet Shop', 'SNACKS_DISCRETIONARY', '2026-09-18', 'Gulab jamun, mixture')
ON DUPLICATE KEY UPDATE record_id=record_id;
