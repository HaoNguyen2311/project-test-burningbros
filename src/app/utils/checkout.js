import { loadStripe } from "@stripe/stripe-js";
export async function checkout({ lineItems }) {
  let stripePromise = null;
  const getStripe = () => {
    if (!stripePromise) {
      stripePromise = loadStripe(
        "pk_test_51NqVfJD5gJn0Tg7WPGmluQVNFvWNwuZMnXzyVI99TcG1YbMj4XaV8i3oPlTBYI2S7GrY4TJL1CgotCOnswvYD2Vi00aFogp8Zh"
      );
    }
    return stripePromise;
  };
  const stripe = await getStripe();
  console.log({ stripe, lineItems });
  await stripe.redirectToCheckout({
    mode: "payment",
    lineItems,
    successUrl: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `https://marketplace.carbuyer.com.sg/used-cars/`,
  });
}
