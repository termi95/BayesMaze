import numpy as np
from collections import deque

# Settings
map_size = (8, 8)
start_position = (0, 0)
num_rescuers = 1
num_survivors = 1
obstacle_density = 0.3
start_position = (0, 0)
target_value = 2
visited = set()

def generate_survivor():
    while True:
        position = tuple(np.random.randint(0, map_size[0], 2))
        if position != start_position:
            return position

def generate_obstacles():
    obstacles = np.zeros(map_size, dtype=np.uint8)
    num_obstacles = int(np.prod(map_size) * obstacle_density)
    for _ in range(num_obstacles):
        obstacle_position = tuple(np.random.randint(0, map_size[0], 2))
        while obstacle_position == start_position or obstacles[obstacle_position] == 1:
            obstacle_position = tuple(np.random.randint(0, map_size[0], 2))
        obstacles[obstacle_position] = 1
    return obstacles

def create_map():
    game_map = np.zeros(map_size, dtype=np.uint8)
    for rescuer in rescuers:
        game_map[rescuer] = 1  # 1 reprezentuje ratownika
    game_map[obstacles == 1] = 3  # 3 reprezentuje przeszkody
    game_map[survivor] = 2  # 2 reprezentuje rozbitka
    return game_map

survivor = generate_survivor()
rescuers = [start_position] * num_rescuers
obstacles = generate_obstacles()

def can_reach_target(matrix, start, target, visited):
    x, y = start
    if matrix[x][y] == target:
        return True
    visited.add(start)
    rows, cols = len(matrix), len(matrix[0])
    for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        nx, ny = x + dx, y + dy
        if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 3 and (nx, ny) not in visited:
            if can_reach_target(matrix, (nx, ny), target, visited):
                return True
    return False

def find_shortest_path(matrix, start, target):
    rows, cols = len(matrix), len(matrix[0])
    visited = set()
    queue = deque([(start, [])])

    while queue:
        current, path = queue.popleft()
        x, y = current

        if matrix[x][y] == target:
            return path + [current]

        visited.add(current)

        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and matrix[nx][ny] != 3 and (nx, ny) not in visited:
                queue.append(((nx, ny), path + [current]))

    return None

game_map = create_map()

con = 1
while  con == 1:    
    if can_reach_target(game_map, start_position, target_value,visited):
        con = 0
    game_map = create_map()
        
print(game_map)
    
path = find_shortest_path(game_map, start_position, target_value)
print(path)