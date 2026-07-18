from __future__ import annotations

from django.db.models import Q, QuerySet


def apply_date_filters(queryset: QuerySet, field: str, params) -> QuerySet:
    start = params.get('start')
    end = params.get('end')
    if start:
        queryset = queryset.filter(**{f'{field}__gte': start})
    if end:
        queryset = queryset.filter(**{f'{field}__lte': end})
    return queryset


def apply_search(queryset: QuerySet, params, fields: list[str]) -> QuerySet:
    term = params.get('search')
    if not term:
        return queryset
    query = Q()
    for field in fields:
        query |= Q(**{f'{field}__icontains': term})
    return queryset.filter(query)
