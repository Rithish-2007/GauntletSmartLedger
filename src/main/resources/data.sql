-- Demo seed data: Primary user only (zero mock utility records)
INSERT INTO users (user_id, full_name, email, password_hash)
VALUES (1, 'Rithish Kumar', 'demo@smartledger.local', '$2a$10$eE04wW52gqW9YJg9Y4W91.oUvjJ9jW.832c3f5g5r2.u3W0j0w4aG')
ON DUPLICATE KEY UPDATE user_id=user_id;
