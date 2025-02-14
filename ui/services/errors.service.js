import TokenService from './token.service';
import Store from './store.service';
import router from '../router'

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

const tr = {
  'UNKNOWN_ACCESSOR': 'You have to login to do this operation.',
  'ACCESS_DENIED': 'You don\'t have access to do that.',
  'FAILED': 'Server failed to complete this request.',
  'AUCTION_CLOSED': 'The auction has been closed',
  'LOW_AMOUNT': 'New bid should be higher than the current bid.',
  'CANNOT_MODIFY': 'You cannot modify this auction.',
  'EMAIL_ALREADY_EXISTS': '',
  'USERNAME_ALREADY_EXISTS': '',
  'FILE_TOO_LARGE': 'Files should not be larger than 2MB.',
  'NOT_WINNER': 'You have to win or buy the item in order to rate it.',
  'UNKNOWN_AUCTION': 'Couldn\'t find the auction you requested.',
  'ALREADY_RATED': 'You have already rated this auction.',
  'PENDING': 'Your registration is still pending. You have to be approved to perform this action.',
  'VALIDATION_FAILED': 'The request is malformed.'
}

const Errors = {
  handleResponse(error) {
    const {status } = error.response;
    const error_code = error.response.data.error;
    switch (status) {
      case 401:
        TokenService.removeToken();
        TokenService.removeUserID();
        Store.commit('setUser', null);
        router.push('/login');
        break;
      case 400:
      case 403:
      case 404:
      case 500:
        Errors.showError(error_code);
    }
    return Promise.reject(error);
  },

  showError(error_code) {
    toastr.error(tr[error_code]|| 'Ops, that didn\'t work');
  },
};

export default Errors;