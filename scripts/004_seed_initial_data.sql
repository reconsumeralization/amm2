-- Insert default services
insert into public.services (name, description, duration_minutes, price, category) values
  ('Classic Haircut', 'Traditional scissor cut with styling', 45, 35.00, 'haircut'),
  ('Fade Cut', 'Modern fade with scissor work on top', 60, 45.00, 'haircut'),
  ('Beard Trim', 'Professional beard shaping and trimming', 30, 25.00, 'beard'),
  ('Hot Towel Shave', 'Traditional straight razor shave with hot towel', 45, 40.00, 'beard'),
  ('Hair Wash & Style', 'Shampoo, condition, and styling', 30, 20.00, 'styling'),
  ('Scalp Treatment', 'Deep cleansing scalp massage and treatment', 45, 50.00, 'treatment'),
  ('The Full Service', 'Haircut, beard trim, and hot towel treatment', 90, 75.00, 'package');

-- Note: Staff and customer data will be created through the application
-- when users sign up and are assigned roles
