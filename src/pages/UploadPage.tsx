import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function UploadPage() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('只支持 PDF 文件格式')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      setError('文件大小超過 50MB 限制')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setProgress(10)

    try {
      // 轉換文件為base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const base64Data = await base64Promise
      setProgress(30)

      // 上傳文件
      const { data, error } = await supabase.functions.invoke('pdf-upload', {
        body: {
          fileData: base64Data,
          fileName: file.name,
          fileSize: file.size
        }
      })

      if (error) {
        throw new Error(error.message || '上傳失敗')
      }

      setProgress(100)
      setSuccess('文件上傳成功，分析正在進行中')
      
      // 稍待一下後跳轉到分析頁面
      setTimeout(() => {
        if (data?.data?.analysisId) {
          navigate(`/analysis/${data.data.analysisId}`)
        } else {
          navigate('/')
        }
      }, 2000)

    } catch (err) {
      console.error('上傳錯誤:', err)
      setError(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
    }
  }, [navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0])
      }
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            上傳 PDF 文件
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            上傳您的專利 PDF 文件，我們將為您提取化學結構和生成 SMILES 字符串
          </p>
        </div>

        {/* 上傳區域 */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
          <div 
            {...getRootProps()} 
            className={`min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 border-dashed rounded-lg ${
              isDragActive 
                ? 'border-cyan-500 bg-cyan-500/10' 
                : 'border-slate-600 hover:border-slate-500'
            } ${
              uploading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            {!uploading ? (
              <>
                <Upload className="w-16 h-16 text-cyan-400 mb-6" />
                
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  {isDragActive ? '放開文件以上傳' : '拖放或點擊上傳 PDF 文件'}
                </h3>
                
                <div className="text-center space-y-2">
                  <p className="text-gray-400 flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>支持 PDF 文件格式</span>
                  </p>
                  <p className="text-gray-400 flex items-center justify-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>文件大小上限 50MB</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6"></div>
                
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  正在上傳和分析文件...
                </h3>
                
                <div className="w-full max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>進度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 錯誤提示 */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-8 text-center text-gray-400">
          <p className="mb-2">支持的文件類型：PDF</p>
          <p>分析時間可能需要幾分鐘，請耐心等待</p>
        </div>
      </div>
    </div>
  )
}
