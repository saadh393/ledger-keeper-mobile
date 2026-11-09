const actualMock = require('@gorhom/bottom-sheet/mock');
const React = require('react');

class EnhancedBottomSheetModal extends actualMock.BottomSheetModal {
  dismiss = jest.fn(() => {
    this.data = null;
    this.props.onDismiss?.();
  });

  close = jest.fn(() => {
    this.data = null;
    this.props.onDismiss?.();
  });

  present = jest.fn((data) => {
    this.data = data;
  });

  render() {
    const { children: Content, handleComponent: Handle, backdropComponent: Backdrop } = this.props;
    const content = typeof Content === 'function'
      ? React.createElement(Content, { data: this.data })
      : Content;

    return React.createElement(
      React.Fragment,
      null,
      Backdrop ? React.createElement(Backdrop, { animatedIndex: { value: 0 }, animatedPosition: { value: 0 }, style: {} }) : null,
      Handle ? React.createElement(Handle, { animatedIndex: { value: 0 }, animatedPosition: { value: 0 } }) : null,
      content,
    );
  }
}

module.exports = {
  ...actualMock,
  BottomSheetModal: EnhancedBottomSheetModal,
  useBottomSheetInternal: (unsafe?: boolean) => (unsafe ? null : actualMock.useBottomSheetInternal()),
};
