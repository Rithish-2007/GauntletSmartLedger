-- Demo seed data: Primary user only (zero mock utility records)
INSERT INTO users (user_id, full_name, email, password_hash)
VALUES (1, 'Rithish Kumar', 'demo@smartledger.local', '$2a$10$YIwleC.mNq75FXOIZR4DX.YwB8gfyaykyle08g4ccCgN7qhUGCaGu')
ON DUPLICATE KEY UPDATE user_id=user_id;
