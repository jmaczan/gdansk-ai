from typing import Optional
from pydantic import BaseModel


class GithubUserModel(BaseModel):
    name: Optional[str]
    blog: str
    bio: Optional[str]
    public_repos: int
    followers: int
    avatar_url: str