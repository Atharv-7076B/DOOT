export interface SendPaymentFormValues {
  sender: string;
  receiver: string;
  amount: string;
  pin: string;
}

export interface SendPaymentFormErrors {
  sender?: string;
  receiver?: string;
  amount?: string;
  pin?: string;
}

export function validateSendPaymentForm(values: SendPaymentFormValues): SendPaymentFormErrors {
  const errors: SendPaymentFormErrors = {};

  if (!values.sender) errors.sender = 'Select a sender account.';
  if (!values.receiver) errors.receiver = 'Select a receiver account.';
  if (values.sender && values.receiver && values.sender === values.receiver) {
    errors.receiver = 'Receiver must be different from sender.';
  }

  const amountNumber = Number(values.amount);
  if (!values.amount) {
    errors.amount = 'Enter an amount.';
  } else if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (!values.pin) {
    errors.pin = 'Enter the sender PIN.';
  } else if (!/^\d{4,6}$/.test(values.pin)) {
    errors.pin = 'PIN must be 4–6 digits.';
  }

  return errors;
}

export function isFormValid(errors: SendPaymentFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
