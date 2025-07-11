-- Make the Admin user an actual admin
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = '121fbeb4-0eff-4bc7-be9a-a07a05a9180a';