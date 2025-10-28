"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface Attachment {
  id: string
  nome_arquivo: string
  url: string
  tipo_arquivo: string
  data_upload: string
}

interface ImageGalleryProps {
  attachments: Attachment[]
  ticketId: string
  canDelete: boolean
  apiUrl: string
  token: string
  onDeleteComplete: (fileId: string) => void
}

export function ImageGallery({ attachments, ticketId, canDelete, apiUrl, token, onDeleteComplete }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  if (!attachments || attachments.length === 0) {
    return null
  }

  // Modificar a função handleDelete para usar a URL correta
  const handleDelete = async (fileId: string) => {
    setIsDeleting(true)
    try {
      const ticketIdForRequest =
        typeof ticketId === "string" && ticketId.startsWith("#") ? ticketId.substring(1) : ticketId

      const response = await fetch(`${apiUrl}/api/uploads/${ticketIdForRequest}/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao excluir a imagem")
      }

      toast({
        title: "Imagem excluída",
        description: "A imagem foi removida do chamado.",
      })

      onDeleteComplete(fileId)
    } catch (error) {
      console.error("Erro ao excluir:", error)
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Anexos ({attachments.length})</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group relative aspect-square overflow-hidden rounded-md border bg-muted/40"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="absolute inset-0 h-full w-full p-0"
                  onClick={() => setSelectedImage(attachment)}
                >
                  <img
                    src={attachment.url || "/placeholder.svg"}
                    alt={attachment.nome_arquivo}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={selectedImage?.url || "/placeholder.svg"}
                    alt={selectedImage?.nome_arquivo}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{selectedImage?.nome_arquivo}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado em {selectedImage ? formatDate(selectedImage.data_upload) : ""}
                      </p>
                    </div>
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir anexo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este anexo? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => selectedImage && handleDelete(selectedImage.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  )
}
