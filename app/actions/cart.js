"use client";

let cart = [];

export const addToCart = (item) => {
  cart.push(item);
};

export const getCart = () => {
  return cart;
};

export const clearCart = () => {
  cart = [];
};
