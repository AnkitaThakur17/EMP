import logger from "~/utils/logger";
import Stripe from 'stripe';
import commonConstants from "../constants/commonConstants";
/**
 *  Stripe Payment Gateway Library
 */
class StripeLib {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCustomer(customerEmailAddress) {
    return this.stripe.customers
      .create({
        email: customerEmailAddress,
      })
      .then((customer) => {
        return customer;
      })
      .catch((error) => {
        logger.error(error);
        return error;
      });
  }

  /**
   * Payment API.
   *
   * @param {*} cardToken
   * @param {*} price
   * @param {*} currency
   * @param {*} description
   * @param {*} cutomerId
   * @returns
   */
  async cardPayment(cardToken, price, currency, description, cutomerId) {
    let payObject = {
      amount: Math.round(price * 100),
      currency: currency,
      card: cardToken,
      customer: cutomerId,
      description: description,
      shipping: {
        name: "Jenny Rosen",
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
    };

    return this.stripe.charges
      .create(payObject)
      .then((charge) => {
        let res = {
          status: true,
          data: charge,
        };

        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };

        return res;
      });
  }

  /**
   * Stripe refund API by chargeID.
   *
   * @param {*} chargeID
   * @returns
   */
  async refundByChargeID(chargeID) {
    let refundObject = {
      charge: chargeID,
    };

    return this.stripe.refunds
      .create(refundObject)
      .then((charge) => {
        let res = {
          status: true,
          data: charge,
        };

        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };

        return res;
      });
  }

  /**
   * Delete card
   * @param {*} customerId
   * @param {*} cardId
   * @returns
   */
  async deleteCard(customerId, cardId) {
    return this.stripe.customers
      .deleteSource(customerId, cardId)
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };
        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  async createCard(customerId, token) {
    let cardObject = {
      source: token,
    };
    return this.stripe.customers
      .createSource(customerId, cardObject)
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };
        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  async cardToken(cardData) {
    let payObject = {
      card: cardData,
      // Data should be in this format.
      // card: {
      //     number: '4242424242424242',
      //     exp_month: 4,
      //     exp_year: 2021,
      //     cvc: '314',
      // },
    };
    return this.stripe.tokens
      .create(payObject)
      .then((token) => {
        let res = {
          status: true,
          data: token,
        };
        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }
  // create account link for connect account

  async createAccountLink(account_id) {
    return this.stripe.accountLinks
      .create({
        account: account_id,
        failure_url: "https://koobi.co.uk/",
        success_url: "https://koobi.co.uk/",
        type: "custom_account_verification",
        collect: "currently_due",
      })
      .then((customer) => {
        return customer;
      })
      .catch((error) => {
        logger.error(error);
        return error;
      });
  }

  async stripeFeeCalculator(amount, currency) {
    var fees = {
      USD: { Percent: 2.9, Fixed: 0.3 },
      GBP: { Percent: 2.4, Fixed: 0.2 },
      EUR: { Percent: 2.9, Fixed: 0.25 },
      CAD: { Percent: 2.9, Fixed: 0.3 },
      AUD: { Percent: 2.9, Fixed: 0.3 },
      NOK: { Percent: 2.9, Fixed: 2 },
      DKK: { Percent: 2.9, Fixed: 1.8 },
      SEK: { Percent: 2.9, Fixed: 1.8 },
      JPY: { Percent: 3.6, Fixed: 0 },
      MXN: { Percent: 3.6, Fixed: 3 },
    };

    var _fee = fees[currency];
    var amount = parseFloat(amount);
    //var total = (amount + parseFloat(_fee.Fixed)) / (1 - parseFloat(_fee.Percent) / 100);
    //var fee = total - amount;
    var fee =
      amount * (parseFloat(_fee.Percent) / 100) + parseFloat(_fee.Fixed);
    var total = amount + fee;
    return {
      amount: amount,
      fee: fee.toFixed(2),
      total: total.toFixed(2),
    };
  }

  async fingerprint(token) {
    return this.stripe.tokens
      .retrieve(token)
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };
        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  //create payment intent
  async createIntent(amount, currency, PaymentMethod, customer_id, source) {
   
    if (PaymentMethod == commonConstants.PAYMENT_MODE.STRIPE) {
      // if payment method card
  
      return this.stripe.paymentIntents
        .create({
          payment_method_types: ["card"],
          // amount: (Number(amount) * 100).toFixed(2),
          amount: Math.round(amount * 100), //convert to cents
          currency: currency,
          customer: customer_id,
          payment_method: source,
          // automatic_payment_methods: { enabled: true, }
        })
        .then((confirmation) => {
          let res = {
            status: true,
            data: confirmation,
          };
          return res;
        })
        .catch((error) => {
          let res = {
            status: false,
            data: error,
          };
          return res;
        });
    } else {
      return this.stripe.paymentIntents
        .create({
          // amount: (Number(amount)*100).toFixed(2),
          amount: Math.round(amount * 100), //convert to cents
          currency: currency,
        })
        .then((confirmation) => {
          let res = {
            status: true,
            data: confirmation,
          };
          return res;
        })
        .catch((error) => {
          let res = {
            status: false,
            data: error,
          };
          return res;
        });
    }
  }

  //retrive payment
  async retrivePaymentIntents(id) {
    return this.stripe.paymentIntents
      .retrieve(id)
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };

        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  /**
   * Stripe refund API.
   *
   * @param {*} paymentIntent
   * @param {*} amount
   * @returns
   */
  async refundAmount(paymentIntent, amount) {
    return this.stripe.refunds
      .create({
        payment_intent: paymentIntent,
        amount: Math.round(amount * 100), //convert to cents
      })
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };
        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  /**
   * Confirm Payment
   * @param {*} id
   * @param {*} paymentMethod
   * @returns
   */
  async confirmPayment(id, paymentMethod) {
    // To create a PaymentIntent for confirmation
    return this.stripe.paymentIntents
      .confirm(id, { payment_method: paymentMethod })
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };

        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  /**
   * Confirm Payment
   * @param {*} id
   * @param {*} paymentMethod
   * @returns
   */
  async confirmCardPayment(client_secret, paymentMethod) {
    // To create a PaymentIntent for confirmation
    return this.stripe
      .confirmCardPayment("{PAYMENT_INTENT_CLIENT_SECRET}", {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "Jenny Rosen",
          },
        },
      })
      .then((confirmation) => {
        let res = {
          status: true,
          data: confirmation,
        };

        return res;
      })
      .catch((error) => {
        let res = {
          status: false,
          data: error,
        };
        return res;
      });
  }

  /**
   * Retrive card list
   * @param {*} id
   * @param {*} paymentMethod
   * @returns
   */
  async retriveCards(customerId) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId, {
        expand: ["sources"],
      });

      // Get the default source ID from the customer
      const defaultSourceId = customer.default_source;

      const cards = customer.sources.data.filter(
        (source) => source.object === "card"
      );

      // Add a flag to each card object indicating if it's the default card
      const cardsWithDefaultFlag = cards.map((card) => ({
        ...card,
        isDefault: card.id === defaultSourceId,
      }));

      let res = {
        status: true,
        data: cardsWithDefaultFlag,
      };

      return res;
    } catch (error) {
      let res = {
        status: false,
        data: error,
      };
      return res;
    }
  }

  /**
   * Function to check is provided card_id,
   * is belongs to the user or not.
   * @param {*} customerId
   * @param {*} cardId
   * @returns
  */
  async validateCardBelongsToUser(customerId, cardId) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId, {
        expand: ['sources'],
      });

      const cardExists = customer.sources.data.some(card => card.id === cardId && card.object === 'card');

      return cardExists;
    } catch (error) {

      let res = {
        status: false,
        data: error
      };
      return res;
    }
  }

  /**
  * Deletes all resources associated with an array of Stripe customer IDs.
  * This includes deleting subscriptions, payment methods (cards), and customers themselves.
  *
  * @param {string[]} customerIds - An array of Stripe customer IDs to delete resources for.
  * @returns {Promise<void>} A promise that resolves when all resources are deleted.
  */
  async deleteStripeCustomers(customerIds) {
    try {
      let deletedCustomerIds = [];
      for (const customerId of customerIds) {
        // Delete customer's subscriptions
        const subscriptions = await this.stripe.subscriptions.list({
          customer: customerId,
        });

        for (const subscription of subscriptions.data) {
          await this.stripe.subscriptions.del(subscription.id);
        }

        // Delete customer's payment methods
        const paymentMethods = await this.stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });

        for (const paymentMethod of paymentMethods.data) {
          await this.stripe.paymentMethods.detach(paymentMethod.id);
        }

        // Delete the customer
        await this.stripe.customers.del(customerId);

        deletedCustomerIds.push(customerId);

      }
      return deletedCustomerIds;
    } catch (error) {
      let res = {
        status: false,
        data: error
      };
      return res;
    }
  }

  /**
   * Function to check if card already exists with the same last4 digits.
   * @param {string} customerID - Stripe customer ID.
   * @param {string} newCardLast4 - Last 4 digits of the new card.
   * @returns {boolean} - Returns true if the card doesn't exist, false otherwise.
   */
  async isCardExist(customerID, newCardLast4) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerID,
        type: 'card', // Filter for card payment methods
      });

      return !paymentMethods.data.some((card) => card.card.last4 === newCardLast4);
    } catch (error) {
      // Handle errors here
      console.error('Error checking card existence:', error);
      return false; // Return false in case of an error
    }
  }

  // Function to verify if a card token is valid
  async verifyCardToken(cardToken) {
    try {
      // Retrieve card details using the card token
      const card = await this.stripe.tokens.retrieve(cardToken);

      // Check if the retrieved object is of type 'card'
      if (card && card.type === 'card') {
        // Card token is valid
        return {
          status: true,
          data: card,
        };
      } else {
        // Card token is not valid
        return {
          status: false,
        };
      }
    } catch (error) {
      // Handle any errors that occurred during the verification
      return {
        status: false,
        data: error,
      };
    }
  }

}

module.exports = StripeLib;