/**
 * Skeleton Loading Components
 * P2.3.2: UI/UX Enhancement - Skeleton loaders for cards/lists
 * 
 * @description Optimized skeleton screens for better loading UX
 * @author KırılmazlarPanel Development Team
 * @date July 24, 2025
 */


/**
 * Base skeleton component
 */
export const SkeletonBase = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  ...props
}) => {
  return (
    <div
      className={`
        animate-pulse
        bg-gray-200
        ${width}
        ${height}
        ${rounded}
        ${className}
      `.trim()}
      {...props}
    />
  );
};

/**
 * Product card skeleton
 */
export const ProductCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      {/* Image skeleton */}
      <SkeletonBase
        className="mb-4"
        width="w-full"
        height="h-48"
        rounded="rounded-lg"
      />

      {/* Title skeleton */}
      <SkeletonBase
        className="mb-2"
        width="w-3/4"
        height="h-5"
      />

      {/* Price skeleton */}
      <SkeletonBase
        className="mb-3"
        width="w-1/2"
        height="h-6"
      />

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <SkeletonBase width="w-full" height="h-3" />
        <SkeletonBase width="w-5/6" height="h-3" />
      </div>

      {/* Button skeleton */}
      <SkeletonBase
        width="w-full"
        height="h-10"
        rounded="rounded-md"
      />
    </div>
  );
};

/**
 * Order card skeleton
 */
export const OrderCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Order ID skeleton */}
          <SkeletonBase
            className="mb-2"
            width="w-1/3"
            height="h-5"
          />

          {/* Date skeleton */}
          <SkeletonBase
            width="w-1/4"
            height="h-4"
          />
        </div>

        {/* Status badge skeleton */}
        <SkeletonBase
          width="w-20"
          height="h-6"
          rounded="rounded-full"
        />
      </div>

      {/* Items skeleton */}
      <div className="space-y-2 mb-4">
        <SkeletonBase width="w-full" height="h-4" />
        <SkeletonBase width="w-4/5" height="h-4" />
      </div>

      {/* Total skeleton */}
      <div className="flex justify-between items-center">
        <SkeletonBase width="w-1/4" height="h-5" />
        <SkeletonBase width="w-1/5" height="h-6" />
      </div>
    </div>
  );
};

/**
 * Header skeleton
 */
export const HeaderSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white border-b border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Logo skeleton */}
        <SkeletonBase
          width="w-32"
          height="h-8"
        />

        {/* User menu skeleton */}
        <div className="flex items-center space-x-4">
          <SkeletonBase
            width="w-8"
            height="h-8"
            rounded="rounded-full"
          />
          <SkeletonBase
            width="w-24"
            height="h-6"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * List skeleton with multiple items
 */
export const ListSkeleton = ({
  itemCount = 3,
  ItemComponent = ProductCardSkeleton,
  className = '',
  itemClassName = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: itemCount }, (_, index) => (
        <ItemComponent
          key={index}
          className={itemClassName}
        />
      ))}
    </div>
  );
};

/**
 * Grid skeleton for product catalog
 */
export const GridSkeleton = ({
  itemCount = 6,
  columns = 3,
  ItemComponent = ProductCardSkeleton,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {Array.from({ length: itemCount }, (_, index) => (
        <ItemComponent key={index} />
      ))}
    </div>
  );
};

/**
 * Table skeleton
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg border overflow-hidden ${className}`}>
      {/* Table header skeleton */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }, (_, index) => (
            <SkeletonBase
              key={index}
              width="w-3/4"
              height="h-4"
            />
          ))}
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="divide-y">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <SkeletonBase
                  key={colIndex}
                  width="w-full"
                  height="h-4"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Profile skeleton
 */
export const ProfileSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      {/* Avatar and name */}
      <div className="flex items-center space-x-4 mb-6">
        <SkeletonBase
          width="w-16"
          height="h-16"
          rounded="rounded-full"
        />
        <div className="flex-1">
          <SkeletonBase
            className="mb-2"
            width="w-1/3"
            height="h-6"
          />
          <SkeletonBase
            width="w-1/4"
            height="h-4"
          />
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <SkeletonBase
              className="mb-2"
              width="w-1/4"
              height="h-4"
            />
            <SkeletonBase
              width="w-full"
              height="h-10"
              rounded="rounded-md"
            />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4 mt-6">
        <SkeletonBase
          width="w-24"
          height="h-10"
          rounded="rounded-md"
        />
        <SkeletonBase
          width="w-20"
          height="h-10"
          rounded="rounded-md"
        />
      </div>
    </div>
  );
};

/**
 * Stats card skeleton
 */
export const StatsCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <SkeletonBase
            className="mb-2"
            width="w-3/4"
            height="h-4"
          />
          <SkeletonBase
            width="w-1/2"
            height="h-8"
          />
        </div>
        <SkeletonBase
          width="w-12"
          height="h-12"
          rounded="rounded-full"
        />
      </div>
    </div>
  );
};

/**
 * Chart skeleton
 */
export const ChartSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      {/* Chart title */}
      <SkeletonBase
        className="mb-6"
        width="w-1/3"
        height="h-6"
      />

      {/* Chart area */}
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-end space-x-2">
            <SkeletonBase
              width="w-full"
              height={`h-${Math.floor(Math.random() * 6) + 8}`}
            />
          </div>
        ))}
      </div>

      {/* Chart legend */}
      <div className="flex justify-center space-x-6 mt-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <SkeletonBase
              width="w-3"
              height="h-3"
              rounded="rounded-full"
            />
            <SkeletonBase
              width="w-16"
              height="h-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Navigation skeleton
 */
export const NavigationSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white border-t border-gray-200 p-4 ${className}`}>
      <div className="flex justify-around">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <SkeletonBase
              width="w-6"
              height="h-6"
              rounded="rounded"
            />
            <SkeletonBase
              width="w-12"
              height="h-3"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  SkeletonBase,
  ProductCardSkeleton,
  OrderCardSkeleton,
  HeaderSkeleton,
  ListSkeleton,
  GridSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  NavigationSkeleton
};
