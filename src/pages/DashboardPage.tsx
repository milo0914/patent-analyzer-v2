import { useState, useEffect } from 'react'
import { BarChart3, FileText, Clock, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Analysis } from '@/lib/supabase'

export function DashboardPage() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0
  })

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      
      // 簡單的直接查詢，避免複雜的API調用
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('查詢分析記錄錯誤:', error)
        return
      }
      
      setAnalyses(data || [])
      
      // 計算統計數據
      const total = data?.length || 0
      const completed = data?.filter(a => a.status === 'completed').length || 0
      const processing = data?.filter(a => a.status === 'processing').length || 0
      const failed = data?.filter(a => a.status === 'failed').length || 0
      
      setStats({ total, completed, processing, failed })
      
    } catch (error) {
      console.error('載入分析記錄失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'processing': return '處理中'
      case 'failed': return '失敗'
      default: return '未知'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          歡迎回來，{user?.email?.split('@')[0] || '用戶'}
        </h1>
        <p className="text-gray-400">
          這裡是您的專利分析儀表板，檢視您的分析數據和統計資訊
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">總分析數</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">成功完成</p>
              <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">處理中</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.processing}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">失敗</p>
              <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 最近分析 */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">最近分析</h2>
            <Link
              to="/upload"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>新增分析</span>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">尚無分析記錄</h3>
              <p className="text-gray-500 mb-6">開始上傳您的第一個 PDF 文件進行分析</p>
              <Link
                to="/upload"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>上傳文件</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-white">{analysis.file_name}</h3>
                      <p className="text-sm text-gray-400">{formatDate(analysis.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-medium ${getStatusColor(analysis.status)}`}>
                      {getStatusText(analysis.status)}
                    </span>
                    
                    <Link
                      to={`/analysis/${analysis.id}`}
                      className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                    >
                      查看
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
