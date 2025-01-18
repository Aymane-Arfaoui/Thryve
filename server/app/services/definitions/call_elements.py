from abc import ABC, abstractmethod

class CallElement(ABC):

    @abstractmethod
    def initialize_from_start_data(self, data : dict):
        pass