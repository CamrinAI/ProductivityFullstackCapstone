"""Service for monitoring and pinging endpoints."""
import httpx
import asyncio
import logging
from app.models import MonitorResult, StatusTier

logger = logging.getLogger(__name__)

class MonitorService:
    """Service for monitoring endpoint latency."""
    
    def __init__(self, timeout=5):
        self.timeout = timeout
    
    async def ping_url(self, url):
        """
        Ping a URL and measure latency.
        
        Returns:
            dict: {'latency_ms': float, 'status_tier': str, 'http_status': int, 'error': str or None}
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                start = asyncio.get_event_loop().time()
                response = await client.get(url)
                latency_ms = (asyncio.get_event_loop().time() - start) * 1000
                
                status_tier = MonitorResult.determine_tier(latency_ms)
                
                return {
                    'latency_ms': round(latency_ms, 2),
                    'status_tier': status_tier,
                    'http_status': response.status_code,
                    'error': None
                }
        
        except asyncio.TimeoutError:
            logger.warning(f"Timeout while pinging {url}")
            return {
                'latency_ms': self.timeout * 1000,
                'status_tier': StatusTier.EGGMAN.value,
                'http_status': 408,
                'error': 'Request timeout'
            }
        
        except Exception as e:
            logger.error(f"Error pinging {url}: {str(e)}")
            return {
                'latency_ms': 0,
                'status_tier': StatusTier.EGGMAN.value,
                'http_status': 500,
                'error': str(e)
            }
    
    @staticmethod
    def create_monitor_result(monitor, ping_result):
        """Create a MonitorResult from ping results."""
        result = MonitorResult(
            monitor_id=monitor.id,
            latency_ms=ping_result['latency_ms'],
            status_tier=ping_result['status_tier'],
            http_status=ping_result['http_status'],
            error_message=ping_result['error']
        )
        return result
