export interface ProjectDto {
  id: number
  name: string
  link: string
  description: string
  assignees: string[] // ids of assignees
  fullname: string[] // full name of assignees
  image?: Image
  tehcno: string[]
  likes: number
  year: number
  specification: string[]
  spec_name: string[]
  status: "Displayed" | "Hidden"
  comment?: string[] // comment ids
  date: Date
}
export interface Image {
  id: string
  size: number
  url: string
  type: string
  filename: string
  thumbnails: Thumbnail
}
export interface Thumbnail {
  small?: ThumbnailSize
  medium?: ThumbnailSize
  large?: ThumbnailSize
}
export interface ThumbnailSize {
  url: string
  width: number
  height: number
}
