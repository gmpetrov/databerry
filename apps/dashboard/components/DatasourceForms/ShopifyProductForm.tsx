import React from 'react';

import {
  DatasourceSchema,
  DatasourceShopifyProduct,
} from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps<DatasourceShopifyProduct> & {};

export default function ShopifyProductForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={DatasourceSchema}
      {...rest}
      hideName
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.shopify_product,
      }}
    />
  );
}
