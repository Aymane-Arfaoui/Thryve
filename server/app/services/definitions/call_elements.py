from abc import ABC, abstractmethod

class CallElement(ABC):

    @abstractmethod
    async def initialize_from_start_data(self, data : dict):
        pass