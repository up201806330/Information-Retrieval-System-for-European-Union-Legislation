import queue
import time
import urllib.request
from threading import Thread

def perform_web_requests(addresses, no_workers):
    class Worker(Thread):
        def __init__(self, request_queue):
            Thread.__init__(self)
            self.queue = request_queue
            self.results = []

        def run(self):
            while True:
                content = self.queue.get()
                print("Processing " + content)
                if content == "":
                    break
                request = urllib.request.Request(content)
                response = urllib.request.urlopen(request)
                self.results.append(response.read())
                self.queue.task_done()

    # Create queue and add addresses
    q = queue.Queue()
    for url in addresses:
        q.put(url)

    # Create workers and add tot the queue
    workers = []
    for _ in range(no_workers):
        worker = Worker(q)
        worker.start()
        workers.append(worker)
    # Workers keep working till they receive an empty string
    for _ in workers:
        q.put("")
    # Join workers to wait till they finished
    for worker in workers:
        worker.join()

    # Combine results from all workers
    r = []
    for worker in workers:
        r.extend(worker.results)
    return r

urls = [ "http://api.epdb.eu/eurlex/document/?offset=" + str(i) for i in range(0, 139000, 1000) ]

results = perform_web_requests(urls, 8)

print(results.keys())
