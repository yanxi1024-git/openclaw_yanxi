import re
from datetime import datetime
from typing import List, Dict, Any, Optional

class SessionSnapshotExtractor:
    """
    Extract structured state from conversation sessions
    Bridge layer: transient → persistent
    """
    
    def __init__(self):
        self.extraction_patterns = {
            'decisions': [
                r'(?:决定|决策|确定|确认|approve|confirm|decide)[：:]\s*(.+)',
                r'(?:我们|我)\s*(?:决定|确认|同意)\s*(.+)',
            ],
            'facts': [
                r'(?:事实是|注意|重要|key fact)[：:]\s*(.+)',
                r'(?:发现|注意到)\s*(.+)',
            ],
            'tasks': [
                r'(?:任务|todo|action)[：:]\s*(.+)',
                r'(?:需要|应该|必须)\s*(.+)',
            ],
            'blockers': [
                r'(?:问题|障碍|blocker|risk)[：:]\s*(.+)',
                r'(?:但是|然而|不过)\s*(.+)',
            ]
        }
    
    def extract_from_conversation(self, conversation: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Extract structured information from conversation history
        
        Args:
            conversation: List of {'role': 'user'|'assistant', 'content': str}
        
        Returns:
            Structured snapshot with decisions, facts, tasks, blockers
        """
        snapshot = {
            'session_id': self._generate_session_id(),
            'extracted_at': datetime.now().isoformat(),
            'message_count': len(conversation),
            'summary': self._generate_summary(conversation),
            'decisions': [],
            'new_facts': [],
            'unfinished_tasks': [],
            'blockers': [],
            'writeback_required': False
        }
        
        # Combine all content for analysis
        full_text = '\n'.join([msg['content'] for msg in conversation])
        
        # Extract each type
        snapshot['decisions'] = self._extract_pattern(full_text, 'decisions')
        snapshot['new_facts'] = self._extract_pattern(full_text, 'facts')
        snapshot['unfinished_tasks'] = self._extract_pattern(full_text, 'tasks')
        snapshot['blockers'] = self._extract_pattern(full_text, 'blockers')
        
        # Determine if writeback is needed
        snapshot['writeback_required'] = (
            len(snapshot['decisions']) > 0 or
            len(snapshot['new_facts']) > 0 or
            len(snapshot['unfinished_tasks']) > 0
        )
        
        return snapshot
    
    def _extract_pattern(self, text: str, pattern_type: str) -> List[str]:
        """Extract items matching patterns"""
        results = []
        patterns = self.extraction_patterns.get(pattern_type, [])
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            results.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_results = []
        for item in results:
            item_clean = item.strip()
            if item_clean and item_clean not in seen:
                seen.add(item_clean)
                unique_results.append(item_clean)
        
        return unique_results[:10]  # Limit to top 10
    
    def _generate_summary(self, conversation: List[Dict[str, str]]) -> str:
        """Generate brief summary of conversation"""
        if not conversation:
            return "Empty session"
        
        # Get first user message as topic
        first_user_msg = None
        for msg in conversation:
            if msg.get('role') == 'user':
                first_user_msg = msg['content']
                break
        
        if first_user_msg:
            # Truncate to first sentence or 100 chars
            summary = first_user_msg.split('.')[0][:100]
            return summary + "..." if len(first_user_msg) > 100 else summary
        
        return f"Session with {len(conversation)} messages"
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def format_for_memory(self, snapshot: Dict[str, Any]) -> str:
        """Format snapshot for memory file"""
        lines = [
            f"## Session Snapshot: {snapshot['session_id']}",
            f"**Time**: {snapshot['extracted_at']}",
            f"**Messages**: {snapshot['message_count']}",
            "",
            f"**Summary**: {snapshot['summary']}",
            ""
        ]
        
        if snapshot['decisions']:
            lines.extend(["### Decisions", ""])
            for i, decision in enumerate(snapshot['decisions'], 1):
                lines.append(f"{i}. {decision}")
            lines.append("")
        
        if snapshot['new_facts']:
            lines.extend(["### New Facts", ""])
            for i, fact in enumerate(snapshot['new_facts'], 1):
                lines.append(f"{i}. {fact}")
            lines.append("")
        
        if snapshot['unfinished_tasks']:
            lines.extend(["### Unfinished Tasks", ""])
            for i, task in enumerate(snapshot['unfinished_tasks'], 1):
                lines.append(f"- [ ] {task}")
            lines.append("")
        
        if snapshot['blockers']:
            lines.extend(["### Blockers", ""])
            for i, blocker in enumerate(snapshot['blockers'], 1):
                lines.append(f"{i}. {blocker}")
            lines.append("")
        
        lines.append(f"**Writeback Required**: {'Yes' if snapshot['writeback_required'] else 'No'}")
        
        return '\n'.join(lines)