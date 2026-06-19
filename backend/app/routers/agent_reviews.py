from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.deps import CurrentUser, DbSession
from app.models.agent_review import AgentReview
from app.models.user import User

router = APIRouter(prefix="/api/agent-reviews", tags=["agent_reviews"])


class ReviewCreate(BaseModel):
    rating: float
    comment: str = ""


@router.get("/{agent_id}")
def get_reviews(agent_id: int, db: DbSession) -> list[dict]:
    reviews = (
        db.query(AgentReview)
        .filter(AgentReview.agent_id == agent_id)
        .order_by(AgentReview.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "reviewer_name": db.get(User, r.reviewer_id).full_name if db.get(User, r.reviewer_id) else "",
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in reviews
    ]


@router.post("/{agent_id}", status_code=201)
def create_review(agent_id: int, body: ReviewCreate, db: DbSession, user: CurrentUser) -> dict:
    if user.id == agent_id:
        raise HTTPException(400, "Cannot review yourself")
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(400, "Rating must be between 1 and 5")
    agent = db.get(User, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    review = AgentReview(agent_id=agent_id, reviewer_id=user.id, rating=body.rating, comment=body.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return {"id": review.id, "rating": review.rating}


@router.get("/{agent_id}/summary")
def get_agent_rating_summary(agent_id: int, db: DbSession) -> dict:
    reviews = db.query(AgentReview).filter(AgentReview.agent_id == agent_id).all()
    if not reviews:
        return {"avg_rating": 0, "total_reviews": 0, "distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}}
    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        dist[int(r.rating)] = dist.get(int(r.rating), 0) + 1
    return {
        "avg_rating": round(sum(r.rating for r in reviews) / len(reviews), 1),
        "total_reviews": len(reviews),
        "distribution": dist,
    }
