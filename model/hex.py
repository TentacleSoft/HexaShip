import unittest


class Orientation:
    U, UR, DR, D, DL, UL = range(6)


class Position:
    def __init__(self, x=0, y=0, z=0):
        self.x = x
        self.y = y
        self.z = z

    def distance_to(self, pos):
        return (abs(pos.x - self.x) + abs(pos.y - self.y) + abs(pos.z - self.z)) / 2

    def orientation_to(self, pos):
        if pos.x == self.x:
            if pos.y > self.y:
                return Orientation.U
            else:
                return Orientation.D
        elif pos.y == self.y:
            if pos.x > self.x:
                return Orientation.UR
            else:
                return Orientation.DL
        elif pos.z == self.z:
            if pos.y > self.y:
                return Orientation.UL
            else:
                return Orientation.DR


class TestPosition(unittest.TestCase):
    def test_distance_to(self):
        p1 = Position(1, 2, 3)
        p2 = Position(-1, 2, 5)

        self.assertEqual(p1.distance_to(p2), 3)

if __name__ == '__main__':
    unittest.main()
