'use client'

import { useState } from 'react'

interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
}

export default function FileUploadSection({
  onFileSelect,
}: {
  onFileSelect?: (file: UploadedFile) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 업로드 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        setError(error.error || '업로드에 실패했습니다.')
        setUploading(false)
        return
      }

      const data = await response.json()
      const uploadedFileData: UploadedFile = {
        url: data.url,
        filename: data.filename,
        size: data.size,
        type: data.type,
      }
      setUploadedFile(uploadedFileData)
      onFileSelect?.(uploadedFileData)

    } catch (err) {
      console.error('Upload error:', err)
      setError('업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setError('')
    setUploadProgress(0)
  }

  return (
    <div className="card mb-6">
      <h3 className="font-medium text-gray-900 mb-4">📤 파일 업로드</h3>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          <p className="font-medium">⚠️ {error}</p>
          <p className="text-xs mt-1">다시 시도해주세요. 계속 오류가 발생하면 YouTube 링크 방식을 사용할 수 있습니다.</p>
        </div>
      )}

      {/* 업로드 영역 */}
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center bg-purple-50 hover:border-purple-400 transition">
          <input
            type="file"
            id="file-input"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept="video/*,image/*,.pdf,.txt"
          />

          <label htmlFor="file-input" className="block cursor-pointer">
            <div className="text-4xl mb-3">📁</div>
            <p className="font-medium text-gray-900 mb-1 text-lg">
              {uploading ? '업로드 중입니다...' : '파일을 선택해주세요'}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              영상 (MP4, WebM), 사진 (JPG, PNG), PDF, 텍스트 파일 가능
            </p>
            <p className="text-xs text-gray-400">
              직접 업로드는 최대 4MB · 큰 영상은 YouTube 링크를 이용해주세요
            </p>
          </label>

          {uploading && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">
                업로드 중... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">✅</span>
            <div className="flex-1">
              <p className="font-bold text-green-900 text-lg">업로드 완료!</p>
              <p className="text-sm text-green-700 mt-2 break-words">
                📄 {uploadedFile.filename}
              </p>
              <p className="text-xs text-green-600 mt-1">
                파일 크기: {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB
              </p>
              <p className="text-xs text-green-600 mt-3">
                이 파일이 제출물에 포함됩니다. 아래에서 제목과 설명을 입력하세요.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-green-600 hover:text-green-800 font-medium text-sm whitespace-nowrap"
            >
              변경
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 flex items-start gap-2">
        <span className="text-lg">💡</span>
        <span>스마트폰에서 파일을 선택하면 갤러리에서 직접 영상이나 사진을 선택할 수 있습니다.</span>
      </p>
    </div>
  )
}
