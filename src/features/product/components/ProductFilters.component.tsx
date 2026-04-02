import { Dispatch, SetStateAction, useState } from 'react';
import { Product, ProductType } from '@/shared/types/product';
import {
  getSizesFromProduct,
  getColorsFromProduct,
} from '@/shared/lib/productUtils';

import Button from '@/shared/ui/Button.component';
import Checkbox from '@/shared/ui/Checkbox.component';
import RangeSlider from '@/shared/ui/RangeSlider.component';

interface ProductFiltersProps {
  selectedSizes: string[];
  setSelectedSizes: Dispatch<SetStateAction<string[]>>;
  selectedColors: string[];
  setSelectedColors: Dispatch<SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
  productTypes: ProductType[];
  toggleProductType: (id: string) => void;
  products: Product[];
  resetFilters: () => void;
}

const ProductFilters = ({
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
  productTypes,
  toggleProductType,
  products,
  resetFilters,
}: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = Array.from(
    new Set(products.flatMap((product: Product) => getSizesFromProduct(product))),
  ).sort((a, b) => a.localeCompare(b));

  const availableColors = products
    .flatMap((product: Product) => getColorsFromProduct(product))
    .filter(
      (color, index, self) =>
        index === self.findIndex((candidate) => candidate.slug === color.slug),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const colors = availableColors.map((color) => ({
    name: color.name,
    class: `bg-${color.slug}-500`,
  }));

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((entry) => entry !== size) : [...prev, size],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((entry) => entry !== color) : [...prev, color],
    );
  };

  return (
    <div className="w-full flex-shrink-0 md:w-64">
      <div className="rounded-lg bg-white shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-6 py-4 text-left md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          <span className="font-semibold">Filter</span>
          <span className="text-xl leading-none">{isOpen ? '−' : '+'}</span>
        </button>

        <div className={`${isOpen ? 'block' : 'hidden'} px-8 pb-8 sm:px-6 sm:pb-6 md:block`}>
          <div className="mb-8 pt-2 md:pt-6">
            <h3 className="mb-4 font-semibold">PRODUKT TYPE</h3>
            <div className="space-y-2">
              {productTypes.map((type) => (
                <Checkbox
                  key={type.id}
                  id={type.id}
                  label={type.name}
                  checked={type.checked}
                  onChange={() => toggleProductType(type.id)}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 font-semibold">PRIS</h3>
            <RangeSlider
              id="price-range"
              label="Pris"
              min={0}
              max={1000}
              value={priceRange[1]}
              startValue={priceRange[0]}
              onChange={(value) => setPriceRange([priceRange[0], value])}
              formatValue={(value) => `kr ${value}`}
            />
          </div>

          <div className="mb-8">
            <h3 className="mb-4 font-semibold">STÃ˜RRELSE</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  handleButtonClick={() => toggleSize(size)}
                  variant="filter"
                  selected={selectedSizes.includes(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 font-semibold">FARGE</h3>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                    color.class
                  } ${
                    selectedColors.includes(color.name)
                      ? 'ring-2 ring-offset-2 ring-gray-900'
                      : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <Button handleButtonClick={resetFilters} variant="reset">
            Resett filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
