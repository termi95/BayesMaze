from flask import json, render_template
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
game_images_dic = {0:'images/water.jpeg', 1:'images/water.jpeg', 2:'images/water.jpeg', 3:'images/rocks.jpg'}

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
    survivor = generate_survivor()
    rescuers = [start_position] * num_rescuers
    obstacles = generate_obstacles()
    
    game_map = np.zeros(map_size, dtype=np.uint8)
    for rescuer in rescuers:
        game_map[rescuer] = 1  # 1 ratownicu
    game_map[obstacles == 1] = 3  # 3 przeszkody
    game_map[survivor] = 2  # 2 rozbitkowie
    return game_map


def can_reach_target(_path, _map):
  last_step = len(_path) - 1
  last_step_value = _map[_path[last_step][0]][_path[last_step][1]]
  return last_step_value == 2

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

def calculate_probabilities(matrix):
    rows, cols = matrix.shape
    target_position = np.where(matrix == 2)  # Pozycja celu

    if len(target_position[0]) == 0:
        print("Nie znaleziono celu.")
        return None

    target_x, target_y = target_position[0][0], target_position[1][0]
    probabilities = np.zeros((rows, cols))

    for i in range(rows):
        for j in range(cols):
            if matrix[i][j] == 3:
                probabilities[i][j] = 0
            else:                
                distance = abs(i - target_x) + abs(j - target_y)
                probabilities[i][j] = 1 / (distance + 1)
                    
    probabilities /= np.sum(probabilities)
    for i in range(rows):
        for j in range(cols):
            probabilities[i][j] = "{:.2f}".format(probabilities[i][j])

    return probabilities

def get_html_game_board(game_map):    
    rows, cols = game_map.shape
    return render_template("game_board.html", rows=rows, cols=cols, game_map=game_map, images = game_images_dic)
    
def get_game_data():
    data = {}
    while  True:    
        game_map = create_map()
        shortest_path = find_shortest_path(game_map, start_position, target_value)    
        if shortest_path is not None and can_reach_target(shortest_path, game_map):
            break
        print('Map was impossible to solve, new map is generating.')

    probabilities = calculate_probabilities(game_map)
    
    data["game_board"] = get_html_game_board(game_map)
    data["probabilities"] = probabilities.tolist()
    data["game_map"] = game_map.tolist()
    data["shortest_path"] = shortest_path
    
    # For debug
    #print(json.dumps(data))
    
    return json.dumps(data)