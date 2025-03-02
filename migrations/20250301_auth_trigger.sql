-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, terms_accepted_at, terms_version, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted_at')::timestamp with time zone, NOW()),
    COALESCE(NEW.raw_user_meta_data->>'terms_version', '1.0'),
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_creation();
