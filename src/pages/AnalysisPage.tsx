import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase, Analysis } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (id) {
      loadAnalysis()
      
      // 如果是處理中狀態，定時刷新
      const interval = setInterval(() => {
        if (analysis?.status === 'processing') {
          loadAnalysis(true)
        }
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [id, analysis?.status])

  const loadAnalysis = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      // 直接查詢數據庫，避免複雜的API調用
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()
      
      if (error) {
        console.error('查詢分析詳情錯誤:', error)
        return
      }
      
      setAnalysis(data)
      
    } catch (error) {
      console.error('載入分析詳情失敗:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'processing': return <Clock className="w-6 h-6 text-yellow-400 animate-spin" />
      case 'failed': return <XCircle className="w-6 h-6 text-red-400" />
      default: return <Clock className="w-6 h-6 text-gray-400" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
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
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-400 mb-4">分析記錄未找到</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
          >
            返回儀表板
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頭部導航 */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">
              {analysis.file_name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(analysis.status)}
                <span className={`font-medium ${getStatusColor(analysis.status)}`}>
                  {getStatusText(analysis.status)}
                </span>
              </div>
              
              {refreshing && (
                <div className="flex items-center space-x-2 text-cyan-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">刷新中...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {analysis.file_url && (
              <a
                href={analysis.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>下載 PDF</span>
              </a>
            )}
            
            <button
              onClick={() => loadAnalysis()}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>刷新</span>
            </button>
          </div>
        </div>

        {/* 分析結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 基本信息 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">基本信息</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">文件名稱：</span>
                <span className="text-white">{analysis.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">文件大小：</span>
                <span className="text-white">{(analysis.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">狀態：</span>
                <span className={getStatusColor(analysis.status)}>{getStatusText(analysis.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">進度：</span>
                <span className="text-white">{analysis.progress_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">创建時間：</span>
                <span className="text-white">{formatDate(analysis.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">更新時間：</span>
                <span className="text-white">{formatDate(analysis.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* 化學實體 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">化學實體</h2>
            {analysis.chemical_entities && analysis.chemical_entities.length > 0 ? (
              <div className="space-y-3">
                {analysis.chemical_entities.map((entity, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{entity.text}</p>
                        <p className="text-sm text-gray-400">類型：{entity.type}</p>
                      </div>
                      <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">
                        {entity.confidence ? `${(entity.confidence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">尚無化學實體數據</p>
            )}
          </div>

          {/* SMILES 結構 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">SMILES 結構</h2>
            {analysis.smiles_structures && analysis.smiles_structures.length > 0 ? (
              <div className="space-y-3">
                {analysis.smiles_structures.map((structure, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded border border-slate-600">
                    <div className="mb-2">
                      <p className="text-white font-medium">{structure.name}</p>
                      <p className="text-sm text-cyan-400 font-mono">{structure.smiles}</p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>分子式：{structure.molecular_formula || 'N/A'}</span>
                      <span>置信度：{structure.confidence ? `${(structure.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">尚無 SMILES 結構數據</p>
            )}
          </div>

          {/* 專利信息 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">專利信息</h2>
            {analysis.patent_sections && Object.keys(analysis.patent_sections).length > 0 ? (
              <div className="space-y-3">
                {analysis.patent_sections.title && (
                  <div>
                    <p className="text-gray-400 text-sm">標題：</p>
                    <p className="text-white">{analysis.patent_sections.title}</p>
                  </div>
                )}
                {analysis.patent_sections.abstract && (
                  <div>
                    <p className="text-gray-400 text-sm">摘要：</p>
                    <p className="text-white text-sm">{analysis.patent_sections.abstract}</p>
                  </div>
                )}
                {analysis.patent_sections.inventors && (
                  <div>
                    <p className="text-gray-400 text-sm">發明人：</p>
                    <p className="text-white">{analysis.patent_sections.inventors.join(', ')}</p>
                  </div>
                )}
                {analysis.patent_sections.publication_number && (
                  <div>
                    <p className="text-gray-400 text-sm">公開號：</p>
                    <p className="text-white">{analysis.patent_sections.publication_number}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">尚無專利信息數據</p>
            )}
          </div>
        </div>

        {/* 錯誤信息 */}
        {analysis.status === 'failed' && analysis.error_message && (
          <div className="mt-8 p-6 bg-red-500/20 border border-red-500/50 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-2">分析失敗</h3>
            <p className="text-red-300">{analysis.error_message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
