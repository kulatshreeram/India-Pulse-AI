from typing import List, Dict, Any
from backend.vector_store.vector_db import get_vector_store, compute_hash_embedding
from backend.app.models.news import Article

def get_article_vector(article: Article, v_store) -> List[float]:
    """Helper to get L2-normalized embedding vector for an article."""
    if article.id in v_store.vectors:
        return v_store.vectors[article.id]["vector"]
    
    # Compute on the fly if not indexed yet
    text = f"{article.title}. {article.description or ''}. {article.content or ''}"
    return compute_hash_embedding(text)

def cluster_articles(articles: List[Article], threshold: float = 0.35) -> List[Dict[str, Any]]:
    """
    Clusters articles using a greedy leader-follower algorithm based on vector cosine similarity.
    Each cluster has a lead article and a list of related (duplicate/similar) articles.
    """
    if not articles:
        return []
        
    v_store = get_vector_store()
    
    # List of clusters: each cluster is a dict with {"lead_id": str, "member_ids": [str]}
    clusters = []
    
    # Pre-fetch or compute vectors for all articles
    article_vectors = {}
    for art in articles:
        article_vectors[art.id] = get_article_vector(art, v_store)
        
    # Greedy clustering
    for art in articles:
        art_id = art.id
        art_vec = article_vectors[art_id]
        
        best_similarity = -1.0
        best_cluster_idx = -1
        
        # Compare with the leader of each existing cluster
        for idx, cluster in enumerate(clusters):
            leader_id = cluster["lead_id"]
            leader_vec = article_vectors[leader_id]
            
            # Cosine similarity (dot product of L2 normalized vectors)
            similarity = sum(q * d for q, d in zip(art_vec, leader_vec))
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_cluster_idx = idx
                
        # If similarity exceeds threshold, join cluster
        if best_similarity >= threshold and best_cluster_idx != -1:
            clusters[best_cluster_idx]["member_ids"].append(art_id)
        else:
            # Create a new cluster
            clusters.append({
                "lead_id": art_id,
                "member_ids": [art_id]
            })
            
    # Resolve clusters to actual Article models
    article_map = {art.id: art for art in articles}
    resolved_clusters = []
    
    for cluster in clusters:
        members = [article_map[mid] for mid in cluster["member_ids"] if mid in article_map]
        if not members:
            continue
            
        # Select the 'lead' article: the one with the highest view count, or most breaking, or most recent
        # Here we sort members by view_count (desc), then is_breaking (desc), then published_at (desc)
        members.sort(key=lambda a: (a.view_count or 0, a.is_breaking or False, a.published_at), reverse=True)
        
        lead_article = members[0]
        related_articles = members[1:]
        
        resolved_clusters.append({
            "lead_article": lead_article,
            "related_articles": related_articles,
            "cluster_size": len(members)
        })
        
    # Sort clusters by the lead article's published_at date (newest first)
    resolved_clusters.sort(key=lambda c: c["lead_article"].published_at, reverse=True)
    
    return resolved_clusters
