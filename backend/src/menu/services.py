from src.menu.models import MenuItem, MenuItemVariation, Variation
from src.api.exception_handlers import ApplicationError


def get_menu_item_ingredients(menu_item):
    """
    Get all ingredients for a menu item
    """
    return menu_item.recipe_ingredients.all()


def get_variation_ingredients(vaariation):
    """
    Get all ingredients for a vaariation
    """
    return vaariation.recipe_ingredients.all()


def calculate_max_available(ingredients):
    """Calculate how many of this item can be made based on ingredients"""

    if not ingredients.exists():
        return float("inf")  # No ingredients defined, assume unlimited

    max_available = []
    for recipe_ingredient in ingredients:
        ingredient = recipe_ingredient.ingredient
        required = recipe_ingredient.quantity_required
        if required <= 0:
            continue
        max_available.append(ingredient.quantity_in_stock // required)

    return min(max_available) if max_available else 0


def check_ingredient_availability(menu_item, variations=None, quantity=1):
    """
    Check if there are enough ingredients for a menu item with variations
    Returns (is_available, missing_ingredients)
    """
    missing_ingredients = []

    # Check base menu item ingredients
    item_ingredients = get_menu_item_ingredients(menu_item)
    for recipe_ingredient in item_ingredients:
        ingredient = recipe_ingredient.ingredient
        required = recipe_ingredient.quantity_required * quantity

        if ingredient.quantity_in_stock < required:
            missing_ingredients.append(
                {
                    "ingredient": ingredient.name,
                    "required": required,
                    "available": ingredient.quantity_in_stock,
                    "shortage": required - ingredient.quantity_in_stock,
                }
            )

    # Check variation ingredients
    if variations:
        for variation in variations:
            variation_ingredients = get_variation_ingredients(variation)
            for recipe_ingredient in variation_ingredients:
                ingredient = recipe_ingredient.ingredient
                required = recipe_ingredient.quantity_required * quantity

                if ingredient.quantity_in_stock < required:
                    missing_ingredients.append(
                        {
                            "ingredient": ingredient.name,
                            "required": required,
                            "available": ingredient.quantity_in_stock,
                            "shortage": required - ingredient.quantity_in_stock,
                        }
                    )

    return len(missing_ingredients) == 0, missing_ingredients


def decrease_ingredient_stock(menu_item, variations=None, quantity=1):
    """
    Decrease ingredient stock when this item is sold
    This should be called within a database transaction
    """
    ingredients_updated = []

    try:
        # Decrease base menu item ingredients
        item_ingredients = get_menu_item_ingredients(menu_item)
        for recipe_ingredient in item_ingredients:
            ingredient = recipe_ingredient.ingredient
            required = recipe_ingredient.quantity_required * quantity

            if required > ingredient.quantity_in_stock:
                raise ApplicationError(
                    message=f"Not enough stock for {ingredient.name}. Required: {required}, Available: {ingredient.quantity_in_stock}"
                )

            ingredient.quantity_in_stock -= required
            ingredient.save()
            ingredients_updated.append(ingredient)

            # Check if stock is low and notify
            if ingredient.is_low():
                # You can implement notification logic here
                # For example, send email, create notification record, etc.
                print(f"WARNING: Low stock for {ingredient.name}. Current stock: {ingredient.quantity_in_stock}")

        # Decrease variation ingredients
        if variations:
            for variation in variations:
                variation_ingredients = get_variation_ingredients(variation)
                for recipe_ingredient in variation_ingredients:
                    ingredient = recipe_ingredient.ingredient
                    required = recipe_ingredient.quantity_required * quantity

                    if required > ingredient.quantity_in_stock:
                        raise ApplicationError(
                            message=f"Not enough stock for {ingredient.name} (variation: {variation.value}). Required: {required}, Available: {ingredient.quantity_in_stock}"
                        )

                    ingredient.quantity_in_stock -= required
                    ingredient.save()
                    ingredients_updated.append(ingredient)

                    # Check if stock is low
                    if ingredient.is_low():
                        print(
                            f"WARNING: Low stock for {ingredient.name}. Current stock: {ingredient.quantity_in_stock}"
                        )

        return ingredients_updated

    except Exception as e:
        # If there's an error, the transaction will be rolled back
        # so ingredient quantities will be restored automatically
        raise e


def increase_ingredient_stock(menu_item, variations=None, quantity=1):
    """
    Increase ingredient stock when an order is cancelled or returned
    This should be called within a database transaction
    """
    ingredients_updated = []

    # Increase base menu item ingredients
    item_ingredients = get_menu_item_ingredients(menu_item)
    for recipe_ingredient in item_ingredients:
        ingredient = recipe_ingredient.ingredient
        required = recipe_ingredient.quantity_required * quantity

        ingredient.quantity_in_stock += required
        ingredient.save()
        ingredients_updated.append(ingredient)

    # Increase variation ingredients
    if variations:
        for variation in variations:
            variation_ingredients = get_variation_ingredients(variation)
            for recipe_ingredient in variation_ingredients:
                ingredient = recipe_ingredient.ingredient
                required = recipe_ingredient.quantity_required * quantity

                ingredient.quantity_in_stock += required
                ingredient.save()
                ingredients_updated.append(ingredient)

    return ingredients_updated


def get_ingredient_usage_for_order_item(order_item):
    """
    Calculate ingredient usage for a specific order item
    """
    usage = {}

    # Base item ingredients
    item_ingredients = get_menu_item_ingredients(order_item.item)
    for recipe_ingredient in item_ingredients:
        ingredient = recipe_ingredient.ingredient
        total_needed = recipe_ingredient.quantity_required * order_item.quantity

        if ingredient in usage:
            usage[ingredient] += total_needed
        else:
            usage[ingredient] = total_needed

    # Variation ingredients
    for variation in order_item.item_variations.all():
        variation_ingredients = get_variation_ingredients(variation)
        for recipe_ingredient in variation_ingredients:
            ingredient = recipe_ingredient.ingredient
            total_needed = recipe_ingredient.quantity_required * order_item.quantity

            if ingredient in usage:
                usage[ingredient] += total_needed
            else:
                usage[ingredient] = total_needed

    return usage
