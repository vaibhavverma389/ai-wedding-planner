from fastapi import APIRouter, Depends
from app.api.deps import verify_service_key
from app.schemas.chat import ChatRagRequest, ChatRagResponse
from app.services.rag_service import process_rag_chat

router = APIRouter(tags=["AI Chatbot RAG"])

@router.post("/chat/rag", response_model=ChatRagResponse)
def handle_rag_chat(
    req: ChatRagRequest,
    _auth: str = Depends(verify_service_key)
):
    return process_rag_chat(req)
