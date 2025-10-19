-- AI 旅行规划师 - Supabase 数据库表结构

-- 1. 旅行计划表
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 基本信息
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  days INTEGER NOT NULL,
  budget NUMERIC NOT NULL,
  travelers INTEGER NOT NULL,
  preferences TEXT[] DEFAULT '{}',
  with_children BOOLEAN DEFAULT FALSE,
  start_date DATE,
  
  -- 行程详情
  itinerary JSONB NOT NULL DEFAULT '[]',
  budget_breakdown JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  tips TEXT[] DEFAULT '{}',
  
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 费用记录表
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 费用详情
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  location TEXT,
  
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 收藏景点表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 景点信息
  name TEXT NOT NULL,
  address TEXT,
  location JSONB,
  type TEXT,
  notes TEXT,
  
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_created_at ON travel_plans(created_at DESC);
CREATE INDEX idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- 启用行级安全策略 (RLS)
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 旅行计划策略
CREATE POLICY "用户可以查看自己的旅行计划"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的旅行计划"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的旅行计划"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的旅行计划"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 费用记录策略
CREATE POLICY "用户可以查看自己的费用记录"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的费用记录"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的费用记录"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的费用记录"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- 收藏景点策略
CREATE POLICY "用户可以查看自己的收藏"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加收藏"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的收藏"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
