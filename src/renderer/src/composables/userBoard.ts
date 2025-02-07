import { Board, Node, NodeRelation, RelationType } from '@shared/interfaces'
import { ref } from 'vue'

export const useUserBoard = (userId: string) => {
  const boards = ref<Board[]>([])
  const selectedBoard = ref<Board | null>(null)
  const getBoards = async () => {
    const response = await window.mainService.board.getUserBoards(userId)
    boards.value = response
  }
  const selectBoard = async (boardId: string) => {
    const response = await window.mainService.board.getBoard(boardId)
    console.log(response)
    selectedBoard.value = response
  }
  const createBoard = async () => {
    const response = await window.mainService.board.createBoard({ userId, name: '新面板' })
    getBoards()
    selectBoard(response.id)
    return response
  }
  const createNode = async (boardId: string, node: Node) => {
    const response = await window.mainService.board.createNode(boardId, node)
    getBoards()
    return response
  }
  const updateNode = async (boardId: string, nodeId: string, node: Node) => {
    const response = await window.mainService.board.updateNode(boardId, nodeId, node)
    return response
  }
  const deleteNode = async (boardId: string, nodeId: string) => {
    const response = await window.mainService.board.deleteNode(boardId, nodeId)
    return response
  }
  const createRelation = async (
    boardId: string,
    sourceId: string,
    targetId: string,
    type: RelationType
  ): Promise<NodeRelation> => {
    const response = await window.mainService.board.createRelation(
      boardId,
      sourceId,
      targetId,
      type
    )
    return response
  }
  return {
    boards,
    selectedBoard,
    getBoards,
    selectBoard,
    createBoard,
    createNode,
    updateNode,
    deleteNode,
    createRelation
  }
}
