import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Upload, LogOut, User, Atom } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: BarChart3, label: '儀表板' },
    { path: '/upload', icon: Upload, label: '上傳分析' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* 側邊列 */}
      <div className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <Atom className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">專利分析器</h1>
          </div>

          {/* 導航選單 */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 用戶信息 */}
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0] || '用戶'}
                </p>
                <p className="text-xs text-gray-400">已登入</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="登出"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 主內容區域 */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
