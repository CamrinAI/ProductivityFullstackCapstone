"""Service for Car Battle Engine integrations."""
import requests
import logging
import os

logger = logging.getLogger(__name__)

class CarQueryService:
    """Service for CarQuery API integration."""
    
    BASE_URL = os.getenv('CARQUERY_BASE_URL', 'https://carqueryapi.com/api/0.3')
    
    @staticmethod
    def get_specs(make, model, year):
        """
        Fetch car specifications from CarQuery.
        
        Args:
            make (str): Car manufacturer (e.g., 'Chevrolet')
            model (str): Car model (e.g., 'Corvette')
            year (int): Model year
        
        Returns:
            dict: Car specifications including horsepower, 0-60, etc.
        """
        try:
            params = {
                'cmd': 'getSpecs',
                'make': make,
                'model': model,
                'year': year,
            }
            response = requests.get(f"{CarQueryService.BASE_URL}/", params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') == 'ok':
                specs = data.get('specs', [{}])[0]
                return {
                    'success': True,
                    'make': make,
                    'model': model,
                    'year': year,
                    'horsepower': specs.get('body_type'),
                    'zero_to_sixty_s': specs.get('zero_to_sixty_mph'),
                    'torque_lbft': specs.get('engine_cc'),
                    'raw_specs': specs,
                }
            else:
                logger.warning(f"CarQuery returned status: {data.get('status')}")
                return {'success': False, 'error': 'API returned error status'}
        
        except requests.RequestException as e:
            logger.error(f"CarQuery API error: {str(e)}")
            return {'success': False, 'error': str(e)}


class MarketCheckService:
    """Service for MarketCheck API integration."""
    
    BASE_URL = 'https://api.marketcheck.com/v2'
    API_KEY = os.getenv('MARKETCHECK_API_KEY', '')
    
    @staticmethod
    def get_market_price(make, model, year, zip_code='75146'):
        """
        Fetch market pricing from MarketCheck for a specific ZIP code.
        
        Args:
            make (str): Car manufacturer
            model (str): Car model
            year (int): Model year
            zip_code (str): Target ZIP code (default: Lancaster, TX)
        
        Returns:
            dict: Market pricing data
        """
        if not MarketCheckService.API_KEY:
            logger.warning("MarketCheck API key not configured")
            return {'success': False, 'error': 'API key not configured'}
        
        try:
            endpoint = f"{MarketCheckService.BASE_URL}/predict/car/us/marketcheck_price"
            params = {
                'api_key': MarketCheckService.API_KEY,
                'make': make,
                'model': model,
                'year': year,
                'zip': zip_code,
            }
            response = requests.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'success': True,
                'make': make,
                'model': model,
                'year': year,
                'zip_code': zip_code,
                'fair_market_value': data.get('fair_market_value'),
                'raw_data': data,
            }
        
        except requests.RequestException as e:
            logger.error(f"MarketCheck API error: {str(e)}")
            return {'success': False, 'error': str(e)}


class CarBattleService:
    """Service for running car comparison battles."""
    
    @staticmethod
    def compare_cars(car1_make, car1_model, car1_year, car2_make, car2_model, car2_year, zip_code='75146'):
        """
        Run a head-to-head car battle between two vehicles.
        
        Args:
            car1_make, car1_model, car1_year: First car details
            car2_make, car2_model, car2_year: Second car details
            zip_code: ZIP code for pricing
        
        Returns:
            dict: Battle results with winner and scoring rationale
        """
        # Get specs for both cars
        specs1 = CarQueryService.get_specs(car1_make, car1_model, car1_year)
        specs2 = CarQueryService.get_specs(car2_make, car2_model, car2_year)
        
        # Get pricing for both cars
        price1 = MarketCheckService.get_market_price(car1_make, car1_model, car1_year, zip_code)
        price2 = MarketCheckService.get_market_price(car2_make, car2_model, car2_year, zip_code)
        
        result = {
            'car1': {
                'make': car1_make,
                'model': car1_model,
                'year': car1_year,
                'specs': specs1,
                'pricing': price1,
            },
            'car2': {
                'make': car2_make,
                'model': car2_model,
                'year': car2_year,
                'specs': specs2,
                'pricing': price2,
            },
            'scorecard': {},
            'winner': None,
        }
        
        # Simple scoring logic (can be extended)
        score1 = 0
        score2 = 0
        
        if specs1.get('success') and specs2.get('success'):
            # Compare specs (hypothetical fields)
            if specs1.get('horsepower', 0) > specs2.get('horsepower', 0):
                score1 += 1
                result['scorecard']['horsepower'] = f"{car1_model} wins"
            elif specs2.get('horsepower', 0) > specs1.get('horsepower', 0):
                score2 += 1
                result['scorecard']['horsepower'] = f"{car2_model} wins"
        
        if price1.get('success') and price2.get('success'):
            fmv1 = price1.get('fair_market_value', float('inf'))
            fmv2 = price2.get('fair_market_value', float('inf'))
            
            if fmv1 < fmv2:
                score1 += 1
                result['scorecard']['value'] = f"{car1_model} wins (${fmv1} < ${fmv2})"
            elif fmv2 < fmv1:
                score2 += 1
                result['scorecard']['value'] = f"{car2_model} wins (${fmv2} < ${fmv1})"
        
        result['winner'] = {
            'car': f"{car1_make} {car1_model}" if score1 >= score2 else f"{car2_make} {car2_model}",
            'score1': score1,
            'score2': score2,
        }
        
        return result
