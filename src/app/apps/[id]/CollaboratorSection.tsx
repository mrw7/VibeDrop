import Image from "next/image"
import Link from "next/link"
import { getUserDisplayName, getUserAvatarUrl } from "@/lib/utils"
import AddCollaboratorDialog from "./AddCollaboratorDialog"

interface CollaboratorUser {
  id: string
  name: string | null
  githubLogin: string | null
  avatarUrl: string | null
}

interface CollaboratorWithUser {
  id: string
  role: string
  user: CollaboratorUser
}

interface CollaboratorSectionProps {
  appId: string
  isAuthor: boolean
  canEdit: boolean
  collaborators: CollaboratorWithUser[]
}

export default function CollaboratorSection({
  appId,
  isAuthor,
  canEdit,
  collaborators,
}: CollaboratorSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          协作者
          {collaborators.length > 0 && (
            <span className="text-muted-foreground text-sm font-normal ml-2">
              ({collaborators.length})
            </span>
          )}
        </h3>
        {isAuthor && <AddCollaboratorDialog appId={appId} existingUserIds={collaborators.map((c) => c.user.id)} />}
      </div>

      {collaborators.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isAuthor ? "添加其他用户作为协作者，共同编辑和维护作品" : "暂无协作者"}
        </p>
      ) : (
        <div className="space-y-3">
          {collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between">
              <Link
                href={`/users/${collab.user.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={getUserAvatarUrl(collab.user)}
                  alt={getUserDisplayName(collab.user)}
                  width={32}
                  height={32}
                  className="rounded-full ring-1 ring-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                    {getUserDisplayName(collab.user)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {collab.role === "editor" ? "编辑者" : collab.role}
                  </p>
                </div>
              </Link>
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                {collab.role === "editor" ? "编辑者" : collab.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {canEdit && !isAuthor && (
        <p className="text-xs text-accent mt-3 pt-3 border-t border-border">
          你正在协作此作品
        </p>
      )}
    </div>
  )
}
