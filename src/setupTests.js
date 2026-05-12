import '@testing-library/jest-dom';
import { vi } from 'vitest';

HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.open = true;
});
HTMLDialogElement.prototype.close = vi.fn(function () {
    this.open = false;
});
