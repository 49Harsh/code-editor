class Calculator:
    @staticmethod
    def add_numbers(num1, num2):
        return num1 + num2

# Input from user
a = float(input("Enter the first number: "))
b = float(input("Enter the second number: "))

# Call static method
result = Calculator.add_numbers(a, b)

print("The sum of", a, "and", b, "is:", result)
