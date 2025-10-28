"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, X } from "lucide-react"

interface UploadImageProps {
  ticketId: string
  onUploadComplete: (fileData: any) => void
  apiUrl: string
  token: string
}

export function UploadImage({ ticketId, onUploadComplete, apiUrl, token }: UploadImageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file type
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      })
      return
    }

    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  // Modificar a função handleUpload para usar a URL correta
  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const ticketIdForRequest =
        typeof ticketId === "string" && ticketId.startsWith("#") ? ticketId.substring(1) : ticketId

      const response = await fetch(`${apiUrl}/api/uploads/${ticketIdForRequest}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao fazer upload da imagem")
      }

      const data = await response.json()

      toast({
        title: "Upload concluído",
        description: "A imagem foi anexada ao chamado.",
      })

      // Reset state
      setFile(null)
      setPreview(null)

      // Notify parent component
      onUploadComplete(data.file)
    } catch (error) {
      console.error("Erro no upload:", error)
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível anexar a imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("file-upload")?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Anexar imagem
          </Button>
          <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">Apenas imagens (JPG, PNG, GIF) até 5MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative max-w-xs overflow-hidden rounded-md border">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-auto max-h-48 w-auto object-contain" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={handleUpload} disabled={isUploading}>
              {isUploading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Enviar imagem
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isUploading}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
