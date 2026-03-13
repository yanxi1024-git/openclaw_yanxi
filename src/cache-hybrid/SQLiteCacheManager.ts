import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Generic, TypeVar

T = TypeVar('T')

class SQLiteCacheManager(Generic[T]):
    """
    SQLite-based cache manager for L2 warm data storage
    Reliable, disk-backed, SQL-queryable
    """
    
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = str(Path.home() / ".openclaw" / "cache" / "memory_cache.db")
        
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database with cache table"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS cache (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    category TEXT DEFAULT 'general',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TIMESTAMP
                )
            ''')
            
            # Create indexes for performance
            conn.execute('CREATE INDEX IF NOT EXISTS idx_category ON cache(category)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_expires ON cache(expires_at)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_accessed ON cache(last_accessed)')
            
            conn.commit()
    
    def get(self, key: str, category: str = None) -> Optional[T]:
        """Get value from cache if not expired"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            if category:
                cursor.execute('''
                    SELECT value FROM cache 
                    WHERE key = ? AND category = ? 
                    AND (expires_at IS NULL OR expires_at > ?)
                ''', (key, category, datetime.now()))
            else:
                cursor.execute('''
                    SELECT value FROM cache 
                    WHERE key = ? 
                    AND (expires_at IS NULL OR expires_at > ?)
                ''', (key, datetime.now()))
            
            result = cursor.fetchone()
            
            if result:
                # Update access stats
                cursor.execute('''
                    UPDATE cache 
                    SET access_count = access_count + 1, last_accessed = ?
                    WHERE key = ?
                ''', (datetime.now(), key))
                conn.commit()
                
                # Deserialize
                try:
                    return json.loads(result[0])
                except:
                    return result[0]  # Return as string if not JSON
            
            return None
    
    def set(self, key: str, value: T, category: str = 'general', 
            ttl_seconds: int = 3600) -> bool:
        """Set value in cache with TTL"""
        try:
            expires_at = datetime.now() + timedelta(seconds=ttl_seconds)
            
            # Serialize value
            if isinstance(value, (dict, list)):
                serialized = json.dumps(value)
            else:
                serialized = str(value)
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT OR REPLACE INTO cache 
                    (key, value, category, created_at, expires_at, access_count, last_accessed)
                    VALUES (?, ?, ?, ?, ?, 0, ?)
                ''', (key, serialized, category, datetime.now(), expires_at, datetime.now()))
                conn.commit()
            
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('DELETE FROM cache WHERE key = ?', (key,))
                conn.commit()
            return True
        except:
            return False
    
    def clear_expired(self) -> int:
        """Clear expired entries, return count deleted"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM cache WHERE expires_at < ?', (datetime.now(),))
            deleted = cursor.rowcount
            conn.commit()
            return deleted
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Total entries
            cursor.execute('SELECT COUNT(*) FROM cache')
            total = cursor.fetchone()[0]
            
            # Expired entries
            cursor.execute('SELECT COUNT(*) FROM cache WHERE expires_at < ?', (datetime.now(),))
            expired = cursor.fetchone()[0]
            
            # Category distribution
            cursor.execute('SELECT category, COUNT(*) FROM cache GROUP BY category')
            categories = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Top accessed
            cursor.execute('''
                SELECT key, access_count FROM cache 
                ORDER BY access_count DESC LIMIT 5
            ''')
            top_accessed = cursor.fetchall()
            
            return {
                'total_entries': total,
                'expired_entries': expired,
                'valid_entries': total - expired,
                'categories': categories,
                'top_accessed': top_accessed
            }
    
    def get_by_category(self, category: str, limit: int = 100) -> List[Dict]:
        """Get all entries in a category"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT key, value, created_at, access_count 
                FROM cache 
                WHERE category = ? AND (expires_at IS NULL OR expires_at > ?)
                ORDER BY last_accessed DESC
                LIMIT ?
            ''', (category, datetime.now(), limit))
            
            results = []
            for row in cursor.fetchall():
                try:
                    value = json.loads(row[1])
                except:
                    value = row[1]
                
                results.append({
                    'key': row[0],
                    'value': value,
                    'created_at': row[2],
                    'access_count': row[3]
                })
            
            return results