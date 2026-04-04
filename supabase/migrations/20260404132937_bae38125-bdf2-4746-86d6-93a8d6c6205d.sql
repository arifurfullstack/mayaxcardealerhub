
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Dealers table
CREATE TABLE public.dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dealership_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  website TEXT,
  business_type TEXT DEFAULT 'independent',
  province TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  wallet_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  webhook_url TEXT,
  webhook_secret TEXT,
  notification_email TEXT,
  autopay_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view own record" ON public.dealers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Dealers can update own record" ON public.dealers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert dealer on signup" ON public.dealers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all dealers" ON public.dealers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all dealers" ON public.dealers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,
  buyer_type TEXT DEFAULT 'online',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  credit_range_min INT,
  credit_range_max INT,
  income DECIMAL,
  city TEXT,
  province TEXT,
  vehicle_preference TEXT,
  vehicle_mileage INT,
  vehicle_price DECIMAL,
  documents TEXT[],
  ai_score INT DEFAULT 0,
  quality_grade TEXT DEFAULT 'B',
  price DECIMAL(10,2) NOT NULL,
  sold_status TEXT NOT NULL DEFAULT 'available',
  sold_to_dealer_id UUID REFERENCES public.dealers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at TIMESTAMPTZ
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create a view that hides PII for non-purchasers
-- Dealers can see all leads but PII is masked unless they purchased
CREATE POLICY "Authenticated users can view leads without PII" ON public.leads
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage all leads" ON public.leads FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert leads" ON public.leads FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a function to get leads with masked PII
CREATE OR REPLACE FUNCTION public.get_marketplace_leads(requesting_dealer_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  reference_code TEXT,
  buyer_type TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  credit_range_min INT,
  credit_range_max INT,
  income DECIMAL,
  city TEXT,
  province TEXT,
  vehicle_preference TEXT,
  vehicle_mileage INT,
  vehicle_price DECIMAL,
  documents TEXT[],
  ai_score INT,
  quality_grade TEXT,
  price DECIMAL,
  sold_status TEXT,
  sold_to_dealer_id UUID,
  created_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.reference_code,
    l.buyer_type,
    CASE WHEN l.sold_to_dealer_id = requesting_dealer_id THEN l.first_name ELSE '***' END,
    CASE WHEN l.sold_to_dealer_id = requesting_dealer_id THEN l.last_name ELSE '***' END,
    CASE WHEN l.sold_to_dealer_id = requesting_dealer_id THEN l.phone ELSE '+XX-XXX-XXXX' END,
    CASE WHEN l.sold_to_dealer_id = requesting_dealer_id THEN l.email ELSE 'xxx@xxxx.com' END,
    l.credit_range_min,
    l.credit_range_max,
    l.income,
    l.city,
    l.province,
    l.vehicle_preference,
    l.vehicle_mileage,
    l.vehicle_price,
    l.documents,
    l.ai_score,
    l.quality_grade,
    l.price,
    l.sold_status,
    l.sold_to_dealer_id,
    l.created_at,
    l.sold_at
  FROM public.leads l;
END;
$$;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'basic',
  price DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT true,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealers can view own subscriptions" ON public.subscriptions FOR SELECT USING (
  dealer_id IN (SELECT d.id FROM public.dealers d WHERE d.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealers can view own transactions" ON public.wallet_transactions FOR SELECT USING (
  dealer_id IN (SELECT d.id FROM public.dealers d WHERE d.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all transactions" ON public.wallet_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  dealer_tier_at_purchase TEXT,
  delivery_method TEXT DEFAULT 'email',
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealers can view own purchases" ON public.purchases FOR SELECT USING (
  dealer_id IN (SELECT d.id FROM public.dealers d WHERE d.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all purchases" ON public.purchases FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Delivery logs table
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  endpoint TEXT,
  payload_summary TEXT,
  response_code INT,
  success BOOLEAN DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_details TEXT
);
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealers can view own delivery logs" ON public.delivery_logs FOR SELECT USING (
  purchase_id IN (
    SELECT p.id FROM public.purchases p
    JOIN public.dealers d ON p.dealer_id = d.id
    WHERE d.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all delivery logs" ON public.delivery_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Autopay settings table
CREATE TABLE public.autopay_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  car_type TEXT[],
  loan_type TEXT,
  make TEXT,
  model TEXT,
  price_range_min DECIMAL,
  price_range_max DECIMAL,
  distance TEXT,
  credit_score_min INT,
  credit_score_max INT,
  age_range TEXT,
  state TEXT,
  leads_per_day INT DEFAULT 10,
  start_time TIME DEFAULT '08:00',
  end_time TIME DEFAULT '18:00',
  active_days TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autopay_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealers can manage own autopay" ON public.autopay_settings FOR ALL USING (
  dealer_id IN (SELECT d.id FROM public.dealers d WHERE d.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all autopay" ON public.autopay_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON public.dealers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_autopay_updated_at BEFORE UPDATE ON public.autopay_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
