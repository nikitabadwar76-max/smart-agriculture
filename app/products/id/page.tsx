"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const products = [
  {
    id: 1,
    name: "Fresh Tomato",
    category: "Vegetables",
    price: 40,
    unit: "kg",
    farmer: "Ramesh Farm",
    location: "Kopargaon",
    quantity: 100,
    emoji: "🍅",
    description:
      "Fresh farm-grown tomatoes directly from the farmer. Carefully harvested and supplied fresh to customers.",
  },
  {
    id: 2,
    name: "Fresh Potato",
    category: "Vegetables",
    price: 30,
    unit: "kg",
    farmer: "Shivaji Farm",
    location: "Kopargaon",
    quantity: 80,
    emoji: "🥔",
    description:
      "Fresh quality potatoes harvested directly from our farm.",
  },
  {
    id: 3,
    name: "Fresh Onion",
    category: "Vegetables",
    price: 35,
    unit: "kg",
    farmer: "Ganesh Farm",
    location: "Rahata",
    quantity: 120,
    emoji: "🧅",
    description:
      "Good quality fresh onions directly from the farm.",
  },
  {
    id: 4,
    name: "Fresh Apple",
    category: "Fruits",
    price: 150,
    unit: "kg",
    farmer: "Green Valley Farm",
    location: "Nashik",
    quantity: 50,
    emoji: "🍎",
    description:
      "Fresh and naturally grown apples from our farm.",
  },
  {
    id: 5,
    name: "Fresh Banana",
    category: "Fruits",
    price: 60,
    unit: "dozen",
    farmer: "Krushi Farm",
    location: "Kopargaon",
    quantity: 70,
    emoji: "🍌",
    description:
      "Fresh naturally ripened bananas.",
  },
  {
    id: 6,
    name: "Wheat",
    category: "Grains",
    price: 45,
    unit: "kg",
    farmer: "Sai Farm",
    location: "Shirdi",
    quantity: 200,
    emoji: "🌾",
    description:
      "High-quality farm-grown wheat.",
  },
  {
    id: 7,
    name: "Green Chilli",
    category: "Vegetables",
    price: 80,
    unit: "kg",
    farmer: "Farm Fresh",
    location: "Kopargaon",
    quantity: 60,
    emoji: "🌶️",
    description:
      "Fresh spicy green chillies directly from the farmer.",
  },
  {
    id: 8,
    name: "Mango",
    category: "Fruits",
    price: 120,
    unit: "kg",
    farmer: "Mango Valley",
    location: "Nashik",
    quantity: 90,
    emoji: "🥭",
    description:
      "Fresh seasonal mangoes from the farm.",
  },
];

export default function ProductDetails() {

  const params = useParams();

  const id = Number(params.id);

  const product = products.find(
    (item) => item.id === id
  );


  if (!product) {

    return (

      <main className="product-not-found">

        <h1>
          Product Not Found
        </h1>

        <Link href="/marketplace">
          ← Back to Marketplace
        </Link>

      </main>
    );

  }


  const addToCart = () => {

    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingProduct = existingCart.find(
      (item: any) => item.id === product.id
    );

    if (existingProduct) {

      existingProduct.quantity += 1;

    } else {

      existingCart.push({
        ...product,
        quantity: 1,
      });

    }

    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    alert(`${product.name} added to cart!`);
  };


  return (

    <main className="product-details-page">

      {/* Header */}

      <header className="market-header">

        <Link
          href="/"
          className="market-logo"
        >
          🌱 SmartAgri
        </Link>

        <nav>

          <Link href="/marketplace">
            Marketplace
          </Link>

          <Link href="/cart">
            🛒 Cart
          </Link>

          <Link href="/login">
            Login
          </Link>

        </nav>

      </header>


      {/* Product Details */}

      <section className="product-details">

        <Link
          href="/marketplace"
          className="back-market"
        >
          ← Back to Marketplace
        </Link>


        <div className="product-details-card">

          {/* Image */}

          <div className="details-image">

            <span>
              {product.emoji}
            </span>

            <div className="fresh-label">
              🌱 Fresh From Farm
            </div>

          </div>


          {/* Information */}

          <div className="details-info">

            <span className="details-category">
              {product.category}
            </span>

            <h1>
              {product.name}
            </h1>

            <div className="details-price">

              <strong>
                ₹{product.price}
              </strong>

              <span>
                / {product.unit}
              </span>

            </div>


            <div className="details-farmer">

              <div className="farmer-detail-avatar">
                👨‍🌾
              </div>

              <div>

                <small>
                  Sold by
                </small>

                <h3>
                  {product.farmer}
                </h3>

                <p>
                  📍 {product.location}
                </p>

              </div>

            </div>


            <div className="details-stock">

              <span>
                Available Stock
              </span>

              <strong>
                {product.quantity} {product.unit}
              </strong>

            </div>


            <div className="details-description">

              <h2>
                About this product
              </h2>

              <p>
                {product.description}
              </p>

            </div>


            <div className="details-actions">

              <button
                className="details-cart"
                onClick={addToCart}
              >
                🛒 Add to Cart
              </button>

              <Link
                href="/cart"
                className="details-buy"
              >
                Buy Now
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}