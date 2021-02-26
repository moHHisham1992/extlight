import utils from "./../utils";
import { decryptData } from "./../crypto";
import Settings from "../settings";
import Allowances from "../allowances";

class Base {
  constructor(connectorConfig) {
    // encrypted config from browser storage
    this.connectorConfig = connectorConfig;
    // placeholder for the unlocked config
    this.config = {};
    this.unlocked = false;
    this.settings = new Settings();
    this.allowances = new Allowances();
  }

  async init() {
    return Promise.all([this.allowances.load(), this.settings.load()]);
  }

  unlock(message) {
    try {
      this.config = decryptData(
        this.connectorConfig,
        message.args.password,
        this.settings.salt
      );
      this.unlocked = true;
      return Promise.resolve({ data: { unlocked: this.unlocked } });
    } catch (e) {
      console.log({ action: "unlock", error: e });
      return Promise.resolve({ error: "Failed to decrypt" });
    }
  }

  lock() {
    this.config = {};
    this.unlocked = false;
  }

  isUnlocked(message) {
    return Promise.resolve({ data: { unlocked: this.unlocked } });
  }

  enable(message) {
    if (this.unlocked && this.allowances.isEnabled(message.origin.domain)) {
      return Promise.resolve({ data: { enabled: true } });
    }
    return utils
      .openPrompt(message)
      .then((response) => {
        // if the response should be saved/rememberd we update the allowance for the domain
        // as this returns a promise we must wait until it resolves
        if (response.data.enabled && response.data.remember) {
          return this.allowances
            .updateAllowance(message.origin.domain, {
              isEnabled: true,
            })
            .then(() => {
              return response;
            });
        }
        return response;
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  getAllowance(message) {
    const allowance = this.allowances.getAllowance(message.args.domain); // get the allowance of specific domain provided in the args
    return Promise.resolve({ data: allowance });
  }

  setAllowance(message) {
    return this.allowances
      .updateAllowance(message.origin.domain, message.args)
      .then(() => {
        return true;
      });
  }

  sendPayment(message, executor) {
    let promise;
    if (this.unlocked && this.allowances.hasAllowance(message)) {
      promise = executor();
    } else {
      promise = utils.openPrompt({ ...message }).then((response) => {
        if (response.data.confirmed) {
          return executor();
        } else {
          return response;
        }
      });
    }
    return promise
      .then((paymentResponse) => {
        // TODO: maybe use better check?
        if (paymentResponse.data && paymentResponse.data.payment_error === "") {
          return this.processPayment(message, paymentResponse).then(() => {
            return paymentResponse;
          });
        } else {
          return {
            error: paymentResponse.data && paymentResponse.data.payment_error,
          };
        }
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  processPayment(message, paymentResponse) {
    const route = paymentResponse.data.payment_route;
    const { total_amt } = route;
    const recipient = message.origin.name || message.origin.domain;
    return this.allowances.storePayment(message, paymentResponse).then(() => {
      return utils.notify({
        title: `Paid ${total_amt} Satoshi to ${recipient}`,
        message: `pre image: ${paymentResponse.data.payment_preimage}`,
      });
    });
  }
}

export default Base;
